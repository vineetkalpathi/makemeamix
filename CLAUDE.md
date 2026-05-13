# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server (Turbopack)
pnpm build      # production build (Turbopack)
pnpm lint       # ESLint
```

No test suite exists.

## Architecture

**makemeamix** is a Next.js 15 App Router site where users submit custom mix requests. Submissions are stored in Google Sheets.

### Routes

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page |
| `/craft` | `src/app/craft/page.tsx` | Mix request form (client component) |
| `/craft/success` | `src/app/craft/success/page.tsx` | Confirmation page (server component, reads cookie) |

### Data flow

1. `/craft` page holds all form state in React (`useState`): user info, `SongComponent[]`, and `TransitionNote[]`.
2. Songs/transitions are serialized to JSON and passed as hidden inputs before form submission.
3. The Server Action `submitMix` (`src/app/craft/actions.ts`) validates, calls `getStorageProvider().saveSubmission()`, sets a short-lived `mix_submission` cookie (5 min, `httpOnly`, scoped to `/craft/success`), then redirects.
4. The success page reads that cookie to display submission details.

### Storage layer

`src/lib/storage/` is a thin abstraction over Google Sheets:
- `StorageProvider` interface in `types.ts`
- `GoogleSheetsProvider` (`google-sheets.ts`) writes one row per song. Columns: `submission_id | timestamp | name | email | purpose | song_number | youtube_url | start_time | end_time | song_notes | transition_notes`
- `buildMixSubmission()` in `types.ts` maps the form's `SongComponent[]` + `TransitionNote[]` into `MixSong[]` (matching each transition to the song after it by id convention `transition-${nextSong.id}`)

### Required environment variables

```
GOOGLE_SERVICE_ACCOUNT_JSON=<service account JSON string>
GOOGLE_SPREADSHEET_ID=<sheet id>
```

### Styling

Tailwind CSS v4 (PostCSS). Dark theme with base color `#0b0b0f`. Global CSS in `src/app/globals.css` — currently only defines CSS variables and custom range slider styles. All other styles are inline Tailwind utilities. Fonts: Geist Sans and Geist Mono via `next/font/google`.

### Pending work

See `docs/plans/edit-submission.md` — adds an "Edit Submission" button on the success page that pre-populates the craft form.
