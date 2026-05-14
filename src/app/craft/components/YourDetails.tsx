"use client";

import { ArrowIcon } from "@/app/_components/icons";

export interface DetailsState {
  name: string;
  email: string;
  occasion: string;
  customOccasion: string;
}

export const OCCASIONS: { id: string; label: string }[] = [
  { id: "sangeet", label: "Sangeet" },
  { id: "wedding", label: "Wedding dance" },
  { id: "performance", label: "Performance" },
  { id: "party", label: "Party / event" },
  { id: "casual", label: "Casual listening" },
  { id: "other", label: "Other…" },
];

interface YourDetailsProps {
  open: boolean;
  onToggle: () => void;
  details: DetailsState;
  setDetails: React.Dispatch<React.SetStateAction<DetailsState>>;
  errors?: Record<string, string>;
}

export function YourDetails({ open, onToggle, details, setDetails, errors }: YourDetailsProps) {
  const baseOccasionLabel = OCCASIONS.find((o) => o.id === details.occasion)?.label || "";
  const occasionLabel =
    details.occasion === "other"
      ? details.customOccasion
      : details.customOccasion
      ? `${baseOccasionLabel} — ${details.customOccasion}`
      : baseOccasionLabel;
  const summary = details.name && details.email && occasionLabel
    ? `${details.name} · ${details.email} · ${occasionLabel}`
    : null;

  return (
    <section className="card" style={{ padding: open ? "var(--pad-card)" : "16px 22px" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="serif tabular-nums italic text-ink-mute"
            style={{ fontSize: 24 }}
          >
            01.
          </span>
          <h3 style={{ margin: 0 }}>Your details</h3>
          {summary && !open ? (
            <span
              className="caption hidden truncate md:inline"
              style={{ marginLeft: 8 }}
            >
              {summary}
            </span>
          ) : null}
        </div>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={onToggle}>
          {open ? "Collapse" : "Edit"}
          <ArrowIcon dir={open ? "up" : "down"} size={12} />
        </button>
      </div>

      {summary && !open ? (
        <div
          className="caption mt-2 break-words md:hidden"
          style={{ paddingLeft: 36 }}
        >
          {summary}
        </div>
      ) : null}

      {open ? (
        <div className="mt-4 flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <span className="label">Name</span>
              <input
                className="input"
                placeholder="Vineet"
                value={details.name}
                onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
              />
              {errors?.name ? <ErrorText>{errors.name}</ErrorText> : null}
            </label>
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <span className="label">Email</span>
              <input
                className="input"
                type="email"
                placeholder="you@inbox.com"
                value={details.email}
                onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
              />
              {errors?.email ? <ErrorText>{errors.email}</ErrorText> : null}
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label">Occasion</span>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => {
                const active = details.occasion === o.id;
                return (
                  <button
                    type="button"
                    key={o.id}
                    onClick={() =>
                      setDetails((d) => ({
                        ...d,
                        occasion: o.id,
                      }))
                    }
                    className="font-mono uppercase"
                    style={{
                      cursor: "pointer",
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      letterSpacing: "0.06em",
                      background: active ? "var(--ink)" : "var(--paper)",
                      color: active ? "var(--paper)" : "var(--ink-soft)",
                      border: "1px solid " + (active ? "var(--ink)" : "var(--hairline-strong)"),
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            {details.occasion ? (
              <input
                className="input"
                placeholder="e.g. Bridal entry, freshman orientation, late-night drive…"
                value={details.customOccasion}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, customOccasion: e.target.value }))
                }
              />
            ) : (
              <p className="caption" style={{ margin: 0 }}>
                Pick one. Refine in the notes if it&apos;s mixed.
              </p>
            )}
            {errors?.reason ? <ErrorText>{errors.reason}</ErrorText> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{ color: "var(--terra-2)", fontSize: 11, letterSpacing: "0.04em" }}
    >
      {children}
    </span>
  );
}
