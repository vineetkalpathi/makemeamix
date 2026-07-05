"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "../../_components/icons";
import {
  formatMixTime,
  loadMixcloudWidgetApi,
  type MixcloudWidget,
} from "../utils/mixcloudWidget";

interface MixcloudPlayerProps {
  feedPath: string;
  title: string;
  artist: string;
  description: string;
}

export default function MixcloudPlayer({ feedPath, title, artist, description }: MixcloudPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<MixcloudWidget | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadMixcloudWidgetApi().then(() => {
      if (cancelled || !iframeRef.current || !window.Mixcloud) return;
      const widget = window.Mixcloud.PlayerWidget(iframeRef.current);
      widgetRef.current = widget;
      widget.ready.then(() => {
        if (cancelled) return;
        setReady(true);
        widget.events.play.on(() => {
          setIsPlaying(true);
          setHasPlayedOnce(true);
        });
        widget.events.pause.on(() => setIsPlaying(false));
        widget.events.ended.on(() => setIsPlaying(false));
        widget.events.progress.on((pos, dur) => {
          setPosition(pos);
          setDuration(dur);
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [feedPath]);

  // Browsers only honor play() as a real user gesture on the origin that
  // received the click. Our button lives on this page, but the audio plays
  // in Mixcloud's cross-origin iframe — so the very first play has to come
  // from a genuine click inside that iframe (the mini bar below). Once that
  // origin has been activated, postMessage-driven pause/resume/seek all work.
  const controlsEnabled = ready && hasPlayedOnce;

  const togglePlay = () => {
    const widget = widgetRef.current;
    if (!widget || !controlsEnabled) return;
    if (isPlaying) widget.pause();
    else widget.play();
  };

  const seekToClientX = useCallback(
    (clientX: number) => {
      const widget = widgetRef.current;
      const r = trackRef.current?.getBoundingClientRect();
      if (!widget || !r || !duration) return;
      const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      const next = p * duration;
      widget.seek(next);
      setPosition(next);
    },
    [duration]
  );

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!controlsEnabled) return;
    setDragging(true);
    seekToClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    seekToClientX(e.clientX);
  };

  const endDrag = () => setDragging(false);

  const pct = duration ? (position / duration) * 100 : 0;

  return (
    <article className="card flex flex-col gap-5" style={{ padding: "26px 24px" }}>
      <div className="flex flex-col gap-1">
        <h3 style={{ fontSize: 20 }}>{title}</h3>
        <span className="caption">{artist}</span>
      </div>

      <p className="text-ink-soft m-0" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
        {description}
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!controlsEnabled}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: 46,
            height: 46,
            background: "var(--accent)",
            color: "var(--paper)",
            border: "none",
            cursor: controlsEnabled ? "pointer" : "not-allowed",
            opacity: controlsEnabled ? 1 : 0.5,
          }}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>

        <div className="flex flex-1 flex-col gap-1.5">
          <div
            ref={trackRef}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative select-none"
            style={{
              height: 20,
              display: "flex",
              alignItems: "center",
              cursor: controlsEnabled ? (dragging ? "grabbing" : "pointer") : "default",
              touchAction: "none",
            }}
          >
            <div
              className="absolute inset-x-0 border"
              style={{
                height: 6,
                background: "var(--paper-sunk)",
                borderColor: "var(--hairline)",
                borderRadius: 999,
              }}
            />
            <div
              className="absolute left-0"
              style={{
                width: `${pct}%`,
                height: 6,
                background: "var(--accent)",
                borderRadius: 999,
              }}
            />
            <div
              className="absolute top-1/2"
              aria-hidden="true"
              style={{
                left: `${pct}%`,
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                background: "var(--paper)",
                border: "2px solid var(--accent)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-ink-mute" style={{ fontSize: 11 }}>
            <span>{formatMixTime(position)}</span>
            <span>{formatMixTime(duration)}</span>
          </div>
        </div>
      </div>

      {/*
        Works but looks bolted-on: functional layout, not a design pass.
        The hint text + boxed native mini-bar is the cheapest way to satisfy
        the gesture requirement below, not the intended final look — see
        memory/project_examples_showcase.md for options to revisit.
      */}
      <div className="flex flex-col gap-1.5">
        {!hasPlayedOnce ? (
          <span className="caption text-accent">↓ tap play once here to start</span>
        ) : null}
        {/*
          Mixcloud doesn't expose raw stream URLs, so the audio itself always
          plays through this iframe. Browsers only treat a click as a real
          gesture on the origin that received it, so the first play has to
          happen via a genuine tap on Mixcloud's own control here — after
          that, the custom controls above drive pause/resume/seek fine.
        */}
        <div
          className="overflow-hidden border"
          style={{ borderRadius: "var(--r-md)", borderColor: "var(--hairline)" }}
        >
          <iframe
            ref={iframeRef}
            title={`${title} — Mixcloud player`}
            src={`https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&hide_artwork=1&light=1&feed=${encodeURIComponent(
              feedPath
            )}`}
            allow="autoplay; encrypted-media"
            style={{ width: "100%", height: 60, border: 0, display: "block" }}
          />
        </div>
      </div>
    </article>
  );
}
