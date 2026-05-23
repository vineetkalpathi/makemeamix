"use client";

import { Fragment, useState } from "react";
import { Vinyl } from "@/app/_components/Vinyl";
import { ArrowIcon } from "@/app/_components/icons";
import type { SongComponent } from "../types";
import { formatTime } from "../utils/time";

interface TimelineProps {
  tracks: SongComponent[];
  transitions: Record<string, string>;
  focusedId: string;
  onFocus: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onTransitionChange: (trackId: string, content: string) => void;
}

export function Timeline({
  tracks,
  transitions,
  focusedId,
  onFocus,
  onAdd,
  onRemove,
  onMove,
  onTransitionChange,
}: TimelineProps) {
  return (
    <section>
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="serif tabular-nums italic text-ink-mute"
            style={{ fontSize: 24 }}
          >
            02.
          </span>
          <h3>Tracks</h3>
          <span className="caption hidden sm:inline">
            Tap a card to edit · arrows to reorder
          </span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onAdd}>
          <span style={{ fontSize: 16, lineHeight: 0.6 }}>+</span> Add a track
        </button>
      </div>

      <div
        className="relative overflow-x-auto border"
        style={{
          padding: "20px 18px",
          background: "var(--paper-deep)",
          borderColor: "var(--hairline)",
          borderRadius: "var(--r-lg)",
        }}
      >
        {/* tape-reel strip backdrop */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            left: 8,
            right: 8,
            height: 1,
            background: "var(--hairline-strong)",
            zIndex: 0,
          }}
        />
        <div className="relative z-[1] flex items-stretch">
          {tracks.map((track, i) => (
            <Fragment key={track.id}>
              {i > 0 ? (
                <TransitionSeam
                  value={transitions[track.id] || ""}
                  onChange={(v) => onTransitionChange(track.id, v)}
                />
              ) : null}
              <TrackCard
                track={track}
                index={i + 1}
                focused={track.id === focusedId}
                canRemove={tracks.length > 1}
                onClick={() => onFocus(track.id)}
                onRemove={() => onRemove(track.id)}
                onMove={(dir) => onMove(track.id, dir)}
                canMoveL={i > 0}
                canMoveR={i < tracks.length - 1}
              />
            </Fragment>
          ))}
          <AddTrackTile onClick={onAdd} />
        </div>
      </div>
    </section>
  );
}

interface TrackCardProps {
  track: SongComponent;
  index: number;
  focused: boolean;
  canRemove: boolean;
  onClick: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  canMoveL: boolean;
  canMoveR: boolean;
}

function TrackCard({
  track,
  index,
  focused,
  canRemove,
  onClick,
  onRemove,
  onMove,
  canMoveL,
  canMoveR,
}: TrackCardProps) {
  const dur = Math.max(0, track.endTime - track.startTime);
  const filled = !!track.url && dur > 0;
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer transition-colors"
      style={{
        width: 220,
        minWidth: 220,
        padding: 16,
        background: focused ? "var(--paper)" : "var(--surface)",
        border: "1px solid " + (focused ? "var(--accent)" : "var(--hairline-strong)"),
        borderRadius: "var(--r-md)",
        boxShadow: focused
          ? "0 1px 0 color-mix(in oklch, var(--accent) 30%, transparent), 0 8px 24px -16px var(--accent)"
          : "none",
      }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className="font-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: "0.16em",
            color: focused ? "var(--accent)" : "var(--ink-mute)",
          }}
        >
          TRACK {String(index).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn
            dir="left"
            disabled={!canMoveL}
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
          />
          <IconBtn
            dir="right"
            disabled={!canMoveR}
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
          />
          {canRemove ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove track"
              style={iconBtnStyle(false)}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Vinyl size={42} spinning={filled} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {filled ? (
            <>
              <span
                className="truncate text-ink"
                style={{ fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.2 }}
              >
                {track.title || extractDomain(track.url)}
              </span>
              <span className="font-mono tabular-nums text-ink-mute" style={{ fontSize: 11 }}>
                {formatTime(track.startTime)} → {formatTime(track.endTime)} · {formatTime(dur)}
              </span>
            </>
          ) : (
            <>
              <span
                className="text-ink-faint"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontStyle: "italic",
                }}
              >
                Empty slot
              </span>
              <span className="font-mono text-ink-faint" style={{ fontSize: 11 }}>
                paste a link
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir}
      style={iconBtnStyle(disabled)}
    >
      <ArrowIcon dir={dir} size={12} />
    </button>
  );
}

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    border: "1px solid var(--hairline)",
    background: "transparent",
    color: disabled ? "var(--ink-faint)" : "var(--ink-soft)",
    width: 22,
    height: 22,
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    padding: 0,
    fontSize: 11,
  };
}

function TransitionSeam({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasNote = value.trim().length > 0;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 38 }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Transition notes"
        className="inline-flex items-center justify-center font-mono"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px dashed " + (hasNote ? "var(--accent)" : "var(--hairline-strong)"),
          background: hasNote ? "var(--accent-tint)" : "var(--paper)",
          color: hasNote ? "var(--accent)" : "var(--ink-mute)",
          cursor: "pointer",
          fontSize: 11,
        }}
        title={hasNote ? value : "Add transition note"}
      >
        {hasNote ? "✎" : "~"}
      </button>
      {open ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-[5]"
          style={{
            top: "100%",
            left: "50%",
            transform: "translate(-50%, 12px)",
            width: "min(320px, calc(100vw - 32px))",
            padding: 14,
            background: "var(--paper)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: "var(--r-md)",
            boxShadow: "0 12px 32px -12px rgba(0,0,0,.3)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="label" style={{ marginBottom: 0 }}>
              Transition note
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-mono text-ink-mute"
              style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 11 }}
            >
              Close
            </button>
          </div>
          <textarea
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="textarea"
            rows={3}
            placeholder="Cut, fade, bridge, swap key — anything that shapes the seam…"
          />
        </div>
      ) : null}
    </div>
  );
}

function AddTrackTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-center text-ink-mute"
      style={{
        width: 220,
        minWidth: 220,
        marginLeft: 18,
        padding: 16,
        background: "transparent",
        border: "1.5px dashed var(--hairline-strong)",
        borderRadius: "var(--r-md)",
        fontFamily: "var(--font-body)",
        gap: 10,
      }}
    >
      <div
        className="inline-flex items-center justify-center text-ink-soft"
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1.5px dashed var(--hairline-strong)",
          fontSize: 22,
        }}
      >
        +
      </div>
      <span
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.14em" }}
      >
        Add a track
      </span>
    </button>
  );
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return "—";
  }
}
