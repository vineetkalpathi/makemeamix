"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitMix } from "./actions";
import type { SongComponent, SubmitMixState, TransitionNote } from "./types";
import { OCCASIONS, YourDetails, type DetailsState } from "./components/YourDetails";
import { Timeline } from "./components/Timeline";
import { TrackDetail } from "./components/TrackDetail";
import { CraftHeader } from "./components/CraftHeader";
import { ArrowIcon } from "@/app/_components/icons";

const initialState: SubmitMixState = { success: false, message: "" };

function makeTrack(): SongComponent {
  return {
    id: crypto.randomUUID(),
    url: "",
    title: "",
    startTime: 0,
    endTime: 30,
    duration: 0,
    notes: "",
  };
}

export default function CraftPage() {
  const [state, formAction, isPending] = useActionState(submitMix, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<DetailsState>({
    name: "",
    email: "",
    occasion: "",
    customOccasion: "",
  });
  const [detailsOpen, setDetailsOpen] = useState(true);

  const initialTrack = useMemo(() => makeTrack(), []);
  const [tracks, setTracks] = useState<SongComponent[]>([initialTrack]);
  const [transitions, setTransitions] = useState<Record<string, string>>({});
  const [focusedId, setFocusedId] = useState<string>(initialTrack.id);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (state.message) {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.message]);

  const focused = tracks.find((t) => t.id === focusedId) ?? tracks[0];
  const filledCount = tracks.filter((t) => t.url && t.endTime > t.startTime).length;
  const totalDuration = tracks.reduce(
    (acc, t) => acc + Math.max(0, t.endTime - t.startTime),
    0
  );

  const updateTrack = (id: string, patch: Partial<SongComponent>) =>
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addTrack = () => {
    const t = makeTrack();
    setTracks((prev) => [...prev, t]);
    setTransitions((prev) => ({ ...prev, [t.id]: "" }));
    setFocusedId(t.id);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (id === focusedId && next.length > 0) {
        const fallback = prev[idx - 1] || prev[idx + 1];
        if (fallback) setFocusedId(fallback.id);
      }
      return next;
    });
    setTransitions((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const moveTrack = (id: string, dir: -1 | 1) => {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[ni]] = [next[ni], next[idx]];
      return next;
    });
  };

  // Serialize for the server action.
  const reason = (() => {
    if (details.occasion === "other") return details.customOccasion;
    const label = OCCASIONS.find((o) => o.id === details.occasion)?.label || "";
    return details.customOccasion ? `${label} — ${details.customOccasion}` : label;
  })();

  const transitionsForServer: TransitionNote[] = tracks
    .slice(1)
    .map((t) => ({ id: `transition-${t.id}`, content: transitions[t.id] || "" }));

  const submitDisabled = isPending || filledCount === 0;

  const onSubmitClick = () => {
    if (submitDisabled) return;
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    setShowConfirmModal(false);
    formRef.current?.requestSubmit();
  };

  return (
    <main>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 80 }}>
        <CraftHeader filled={filledCount} total={tracks.length} totalDuration={totalDuration} />

        {state.message ? (
          <div
            ref={bannerRef}
            className="mt-6 font-mono"
            style={{
              padding: "12px 16px",
              background: "color-mix(in oklch, var(--terra-2) 12%, var(--surface))",
              border: "1px solid color-mix(in oklch, var(--terra-2) 30%, transparent)",
              borderRadius: "var(--r-md)",
              color: "color-mix(in oklch, var(--terra-2) 70%, var(--ink))",
              fontSize: 12,
              letterSpacing: "0.04em",
            }}
          >
            {state.message}
          </div>
        ) : null}

        <form ref={formRef} action={formAction} className="mt-7 flex flex-col gap-7">
          <input type="hidden" name="name" value={details.name} />
          <input type="hidden" name="email" value={details.email} />
          <input type="hidden" name="reason" value={reason} />
          <input type="hidden" name="songs" value={JSON.stringify(tracks)} />
          <input
            type="hidden"
            name="transitions"
            value={JSON.stringify(transitionsForServer)}
          />

          <YourDetails
            open={detailsOpen}
            onToggle={() => setDetailsOpen((o) => !o)}
            details={details}
            setDetails={setDetails}
            errors={state.errors}
          />

          <Timeline
            tracks={tracks}
            transitions={transitions}
            focusedId={focusedId}
            onFocus={setFocusedId}
            onAdd={addTrack}
            onRemove={removeTrack}
            onMove={moveTrack}
            onTransitionChange={(id, content) =>
              setTransitions((prev) => ({ ...prev, [id]: content }))
            }
          />

          {focused ? (
            <TrackDetail
              key={focused.id}
              track={focused}
              tracks={tracks}
              transitions={transitions}
              canRemove={tracks.length > 1}
              onChange={(patch) => updateTrack(focused.id, patch)}
              onRemove={() => removeTrack(focused.id)}
              onTransitionChange={(content) =>
                setTransitions((prev) => ({ ...prev, [focused.id]: content }))
              }
            />
          ) : null}

          {state.errors?.songs ? (
            <p className="font-mono text-center" style={{ color: "var(--terra-2)", fontSize: 12 }}>
              {state.errors.songs}
            </p>
          ) : null}

          <SubmitBar
            disabled={submitDisabled}
            isPending={isPending}
            onSubmit={onSubmitClick}
          />
        </form>
      </div>

      {showConfirmModal ? (
        <ConfirmModal
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={confirmSubmit}
        />
      ) : null}
    </main>
  );
}


function SubmitBar({
  disabled,
  isPending,
  onSubmit,
}: {
  disabled: boolean;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3.5"
      style={{
        padding: "20px 24px",
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-lg)",
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="serif-i" style={{ fontSize: 22 }}>
          Ready when you are.
        </span>
        <span className="caption">
          Editing your submission currently requires re-crafting from scratch, so double-check
          your entry.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          aria-disabled={disabled}
          className="btn btn-accent w-full sm:w-auto"
          style={{ padding: "14px 26px" }}
        >
          {isPending ? "Sending…" : "Send the mix request"}
          {!isPending ? <ArrowIcon dir="right" /> : null}
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "color-mix(in oklch, var(--ink) 60%, transparent)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md"
        style={{ background: "var(--paper)" }}
      >
        <h3 className="mb-2">Ready to submit?</h3>
        <p
          className="text-ink-soft"
          style={{ fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" }}
        >
          Editing your submission currently requires re-crafting your mix from scratch, so make
          sure to double-check your entry.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Keep editing
          </button>
          <button type="button" className="btn btn-accent btn-sm" onClick={onConfirm}>
            Yes, submit
          </button>
        </div>
      </div>
    </div>
  );
}
