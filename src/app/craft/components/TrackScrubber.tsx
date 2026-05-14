"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime, parseTimeInput } from "../utils/time";

interface TrackScrubberProps {
  duration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  onStartChange: (v: number) => void;
  onEndChange: (v: number) => void;
  onSeek: (v: number) => void;
}

type DragMode = "start" | "end" | "seek" | null;

export function TrackScrubber({
  duration,
  startTime,
  endTime,
  currentTime,
  onStartChange,
  onEndChange,
  onSeek,
}: TrackScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode>(null);

  const pct = (v: number) => (duration > 0 ? (v / duration) * 100 : 0);

  const valueAt = useCallback(
    (clientX: number) => {
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return 0;
      const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      return Math.round(p * duration);
    },
    [duration]
  );

  const sP = pct(startTime);
  const eP = pct(endTime);
  const cP = pct(currentTime);

  // Larger hit target on touch — handles are only 18px wide visually.
  const hitThreshold = 3;

  const startDragAt = (clientX: number, pointerId: number, target: Element) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((clientX - r.left) / r.width) * 100;
    let mode: Exclude<DragMode, null>;
    if (Math.abs(x - sP) < hitThreshold) mode = "start";
    else if (Math.abs(x - eP) < hitThreshold) mode = "end";
    else {
      const v = valueAt(clientX);
      onSeek(Math.max(startTime, Math.min(endTime, v)));
      mode = "seek";
    }
    setDrag(mode);
    try {
      (target as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(pointerId);
    } catch {
      // not supported — fall back to global listeners below
    }
  };

  const startDragHandle = (
    mode: "start" | "end",
    pointerId: number,
    target: Element
  ) => {
    setDrag(mode);
    try {
      (target as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const v = valueAt(e.clientX);
    if (drag === "start") onStartChange(Math.max(0, Math.min(v, endTime - 1)));
    else if (drag === "end") onEndChange(Math.min(duration, Math.max(v, startTime + 1)));
    else if (drag === "seek") onSeek(Math.max(startTime, Math.min(endTime, v)));
  };

  const endDrag = (e: React.PointerEvent) => {
    setDrag(null);
    const t = e.currentTarget as Element & {
      hasPointerCapture?: (id: number) => boolean;
      releasePointerCapture?: (id: number) => void;
    };
    try {
      if (t.hasPointerCapture?.(e.pointerId)) t.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Fallback for browsers without pointer capture: keep dragging if the
  // pointer leaves the track element entirely.
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const v = valueAt(e.clientX);
      if (drag === "start") onStartChange(Math.max(0, Math.min(v, endTime - 1)));
      else if (drag === "end") onEndChange(Math.min(duration, Math.max(v, startTime + 1)));
      else if (drag === "seek") onSeek(Math.max(startTime, Math.min(endTime, v)));
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, valueAt, onStartChange, onEndChange, onSeek, startTime, endTime, duration]);

  const ticks: number[] = [];
  const tickEvery = duration > 300 ? 60 : 30;
  for (let t = 0; t <= duration; t += tickEvery) ticks.push(t);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={trackRef}
        onPointerDown={(e) => startDragAt(e.clientX, e.pointerId, e.currentTarget)}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative select-none"
        style={{
          height: 44,
          cursor: drag ? "grabbing" : "pointer",
          padding: "12px 0",
          touchAction: "none",
        }}
      >
        {/* base track */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 border"
          style={{
            height: 8,
            background: "var(--paper-sunk)",
            borderColor: "var(--hairline)",
            borderRadius: 999,
          }}
        />
        {/* selected range */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: `${sP}%`,
            width: `${eP - sP}%`,
            height: 8,
            background: "var(--accent)",
            borderRadius: 999,
            boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--accent) 70%, var(--ink))",
          }}
        />
        {/* tick marks */}
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute"
            style={{
              top: "calc(50% + 8px)",
              left: `${pct(t)}%`,
              width: 1,
              height: 5,
              background: "var(--hairline-strong)",
            }}
          />
        ))}
        {/* playhead */}
        {currentTime >= startTime && currentTime <= endTime ? (
          <div
            className="absolute top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              left: `${cP}%`,
              width: 2,
              height: 20,
              background: "var(--ink)",
            }}
          />
        ) : null}
        {/* start handle */}
        <Handle
          left={sP}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDragHandle("start", e.pointerId, e.currentTarget);
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-label="Start"
        />
        {/* end handle */}
        <Handle
          left={eP}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDragHandle("end", e.pointerId, e.currentTarget);
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-label="End"
        />
      </div>

      <div
        className="flex items-center justify-between font-mono text-ink-mute"
        style={{ fontSize: 10.5, letterSpacing: "0.06em" }}
      >
        <span>0:00</span>
        <span className="text-ink-soft">
          {formatTime(startTime)} <span className="text-ink-faint">→</span> {formatTime(endTime)}
          <span className="ml-3 text-accent">{formatTime(endTime - startTime)}</span>
        </span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

interface TimeFieldProps {
  label: string;
  value: number;
  max: number;
  onCommit: (v: number) => void;
}

export function TimeField({ label, value, max, onCommit }: TimeFieldProps) {
  const [draft, setDraft] = useState(formatTime(value));
  const lastValue = useRef(value);

  useEffect(() => {
    if (value !== lastValue.current) {
      setDraft(formatTime(value));
      lastValue.current = value;
    }
  }, [value]);

  return (
    <label className="flex min-w-[120px] flex-1 flex-col gap-1.5">
      <span className="label">{label}</span>
      <div
        className="flex items-center overflow-hidden border"
        style={{
          background: "var(--paper)",
          borderColor: "var(--hairline-strong)",
          borderRadius: "var(--r-md)",
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          className="font-mono"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const v = Math.max(0, Math.min(max || 99999, parseTimeInput(draft)));
            onCommit(v);
            setDraft(formatTime(v));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          style={{
            flex: 1,
            border: 0,
            outline: 0,
            padding: "10px 12px",
            background: "transparent",
            color: "var(--ink)",
            fontSize: 15,
            letterSpacing: "0.02em",
          }}
        />
        <div
          className="flex flex-col"
          style={{ borderLeft: "1px solid var(--hairline)" }}
        >
          <button
            type="button"
            onClick={() => onCommit(Math.min(max || 99999, value + 1))}
            style={stepBtnStyle}
            aria-label={`Increase ${label}`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onCommit(Math.max(0, value - 1))}
            style={stepBtnStyle}
            aria-label={`Decrease ${label}`}
          >
            ▼
          </button>
        </div>
      </div>
    </label>
  );
}

const stepBtnStyle: React.CSSProperties = {
  border: 0,
  padding: "0 9px",
  background: "transparent",
  color: "var(--ink-mute)",
  cursor: "pointer",
  fontSize: 8,
  height: 21,
  lineHeight: 1,
};

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
  left: number;
}

// Visible dot is 18px; transparent hit target is 32px (better for touch).
function Handle({ left, ...rest }: HandleProps) {
  return (
    <div
      {...rest}
      className="absolute top-1/2"
      style={{
        transform: "translate(-50%, -50%)",
        left: `${left}%`,
        width: 32,
        height: 32,
        cursor: "grab",
        zIndex: 2,
        touchAction: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          background: "var(--paper)",
          border: "2px solid var(--ink)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
