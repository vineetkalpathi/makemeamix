# Plan: Pre-populated Edit Flow from Success Page

## Context
After a mix is submitted, the user lands on `/craft/success` which displays their submission details (read from the `mix_submission` cookie). Currently the only CTA is "Submit Another Mix" which starts fresh. The user wants an "Edit" button that returns them to `/craft/page.tsx` with all their previous form data pre-populated.

**Key constraint:** The `mix_submission` cookie is `httpOnly: true, path: "/craft/success"`, so it's only readable on the server and only for that path. The craft page is currently a pure client component (`"use client"`), so it can't call `cookies()` directly.

## Approach

1. **`editSubmission` server action** — called from the success page, it reads the `mix_submission` cookie (available because the action is invoked from `/craft/success`) and writes its data to a new `mix_draft` cookie with `path: "/craft"`, then redirects to `/craft`.

2. **Split `craft/page.tsx`** — convert it to a thin async server component that reads the `mix_draft` cookie and passes the data down as `initialDraft` props to a new `CraftForm` client component.

3. **`CraftForm.tsx`** — extract the current client-side logic from `page.tsx` into this new component. Accepts an optional `initialDraft` prop to seed `useState` initial values instead of empty defaults.

4. **Success page** — add an "Edit Submission" button (a `<form>` with `action={editSubmission}`) alongside the existing "Submit Another Mix" link.

## Files to Modify / Create

| File | Change |
|------|--------|
| `src/app/craft/actions.ts` | Add `editSubmission` server action |
| `src/app/craft/page.tsx` | Convert to async server component shell |
| `src/app/craft/components/CraftForm.tsx` | **New** — extract client logic from page.tsx, accept `initialDraft` prop |
| `src/app/craft/success/page.tsx` | Add "Edit Submission" form button |

## Detailed Steps

### 1. `actions.ts` — Add `editSubmission`
```ts
export async function editSubmission(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mix_submission")?.value;
  if (raw) {
    cookieStore.set("mix_draft", raw, {
      maxAge: 300,
      httpOnly: true,
      path: "/craft",
    });
  }
  redirect("/craft");
}
```
- Reads `mix_submission` (available since action is submitted from `/craft/success`)
- Copies data to `mix_draft` with `path: "/craft"` so the craft page server component can read it
- `maxAge: 300` (5 min) matches the submission cookie; short-lived so it doesn't pollute stale visits

### 2. `page.tsx` — Server component shell
```ts
// No "use client" directive
import { cookies } from "next/headers";
import CraftForm from "./components/CraftForm";

export default async function CraftPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mix_draft")?.value;
  let initialDraft = null;
  if (raw) {
    try { initialDraft = JSON.parse(raw); } catch {}
  }
  return <CraftForm initialDraft={initialDraft} />;
}
```
- The existing `metadata` export stays in `layout.tsx` (already there)
- Passes `initialDraft` (or `null`) to `CraftForm`

### 3. `CraftForm.tsx` — New client component
- Move all current `page.tsx` content (the `"use client"` directive and everything below it) into this file
- Add `initialDraft` prop:
```ts
interface InitialDraft {
  name: string; email: string; reason: string;
  songs: SongComponent[]; transitions: TransitionNote[];
}
interface CraftFormProps { initialDraft?: InitialDraft | null; }
```
- Seed `useState` from `initialDraft` when present:
  - `name`, `email`, `reason` from draft directly
  - `songs`: use draft songs but normalize UI state (`isExpanded: true` for first, `false` for rest; `showWaveform: false` for all)
  - `transitions`: use draft transitions as-is

### 4. `success/page.tsx` — Add Edit button
Add a form with `editSubmission` action in the CTA section, only rendered when `submission` data is present:
```tsx
import { editSubmission } from "../actions";
// ...
{submission && (
  <form action={editSubmission}>
    <button type="submit" className="...">Edit Submission</button>
  </form>
)}
```
Style it as a secondary button (e.g., outline/ghost) to visually distinguish from "Submit Another Mix".

## Data Flow
```
/craft/success (server component)
  → user clicks "Edit Submission"
  → editSubmission() server action runs
      reads mix_submission cookie
      writes mix_draft cookie (path: /craft)
      redirects to /craft
/craft (server component)
  → reads mix_draft cookie
  → passes initialDraft to <CraftForm>
/craft (CraftForm client component)
  → seeds useState with initialDraft values
  → user sees fully pre-populated form
```

## Verification
1. Submit a complete mix (name, email, reason, 2+ songs with times and notes, a transition note)
2. On success page, confirm submission details appear
3. Click "Edit Submission" — should redirect to `/craft` with all fields pre-populated
4. Verify songs have correct YouTube URLs, start/end times, and notes
5. Verify transition notes appear between songs
6. Verify user info (name, email, reason) is filled in
7. Edit one field, resubmit — should go through normally to a new success page
8. Navigate directly to `/craft` (without editing) — form should start empty (cookie expired or not set)
