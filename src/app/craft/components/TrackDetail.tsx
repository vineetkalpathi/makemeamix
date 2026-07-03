"use client";

import { useEffect, useRef, useState } from "react";
import type { SongComponent } from "../types";
import { LoopIcon, PauseIcon, PlayIcon } from "@/app/_components/icons";
import YouTubePreview, { parseYouTubeId } from "./YouTubePreview";
import { TimeField, TrackScrubber } from "./TrackScrubber";
import { formatTime } from "../utils/time";

interface TrackDetailProps {
  track: SongComponent;
  tracks: SongComponent[];
  transitions: Record<string, string>;
  canRemove: boolean;
  onChange: (patch: Partial<SongComponent>) => void;
  onRemove: () => void;
  onTransitionChange: (content: string) => void;
}

export function TrackDetail({
  track,
  tracks,
  transitions,
  canRemove,
  onChange,
  onRemove,
  onTransitionChange,
}: TrackDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(track.startTime);
  const [seekRequest, setSeekRequest] = useState(0);

  const videoId = parseYouTubeId(track.url);
  const previousIdRef = useRef(track.id);
  const previousVideoIdRef = useRef(videoId);

  useEffect(() => {
    if (previousIdRef.current !== track.id) {
      setIsPlaying(false);
      setCurrentTime(track.startTime);
      previousIdRef.current = track.id;
    }
  }, [track.id, track.startTime]);

  useEffect(() => {
    if (!videoId || videoId === previousVideoIdRef.current) return;
    previousVideoIdRef.current = videoId;
    if (track.title) return;
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.title && !track.title) onChange({ title: data.title });
      })
      .catch(() => {});
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDurationReady = (d: number) => {
    if (d && d !== track.duration) onChange({ duration: d });
    if (!track.endTime || track.endTime > d) {
      onChange({ endTime: Math.min(track.endTime || 30, d) });
    }
  };

  const idx = tracks.findIndex((t) => t.id === track.id);
  const isFirst = idx === 0;
  const transitionValue = transitions[track.id] || "";

  return (
    <section className="card overflow-hidden" style={{ padding: 0 }}>
      {/* header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--hairline)",
          background: "var(--paper-deep)",
        }}
      >
        <div className="flex items-baseline gap-3">
          <span
            className="serif tabular-nums italic text-ink-mute"
            style={{ fontSize: 24 }}
          >
            03.
          </span>
          <h3>
            Editing{" "}
            <em className="serif-i text-accent">
              Track {String(idx + 1).padStart(2, "0")}
            </em>
          </h3>
        </div>
        <span className="caption">Trim, label, sequence — leave a note for any seam.</span>
      </div>

      <div className="grid items-stretch gap-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* LEFT: source + scrubber */}
        <div
          className="flex flex-col gap-4 border-b md:border-b-0 md:border-r"
          style={{ padding: 22, borderColor: "var(--hairline)" }}
        >
          <SourceField track={track} onChange={onChange} />
          <YouTubePreview
            videoId={videoId}
            startTime={track.startTime}
            endTime={track.endTime}
            isPlaying={isPlaying}
            isLooping={isLooping}
            seekRequest={seekRequest}
            setIsPlaying={setIsPlaying}
            onTimeChange={setCurrentTime}
            onDurationReady={onDurationReady}
          />

          {/* Transport */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-accent btn-sm"
                disabled={!videoId}
                onClick={() => {
                  setSeekRequest(track.startTime);
                  setIsPlaying(true);
                }}
              >
                <PlayIcon /> Preview selection
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsPlaying((p) => !p)}
                disabled={!videoId}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
            <label
              className="inline-flex cursor-pointer items-center gap-2 font-mono uppercase text-ink-soft"
              style={{ fontSize: 11, letterSpacing: "0.08em" }}
            >
              <input
                type="checkbox"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              <LoopIcon /> Loop
            </label>
          </div>

          <TrackScrubber
            duration={track.duration || track.endTime + 30}
            startTime={track.startTime}
            endTime={track.endTime}
            currentTime={currentTime}
            onStartChange={(v) => onChange({ startTime: v })}
            onEndChange={(v) => onChange({ endTime: v })}
            onSeek={(v) => setSeekRequest(v)}
          />

          <div className="flex flex-wrap items-end gap-3">
            <TimeField
              label="In"
              value={track.startTime}
              max={Math.max(0, track.endTime - 1)}
              onCommit={(v) => onChange({ startTime: v })}
            />
            <div
              className="serif-i tabular-nums text-ink-mute"
              style={{ fontSize: 20, padding: "0 4px 12px" }}
            >
              →
            </div>
            <TimeField
              label="Out"
              value={track.endTime}
              max={track.duration || 99999}
              onCommit={(v) => onChange({ endTime: v })}
            />
          </div>
        </div>

        {/* RIGHT: meta + notes */}
        <div className="flex flex-col gap-4" style={{ padding: 22 }}>
          <label className="flex flex-col gap-1.5">
            <span className="label">
              Track title{" "}
              <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>
                (optional)
              </span>
            </span>
            <input
              className="input"
              placeholder="Auto from link, or label it your way"
              value={track.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </label>

          <label className="flex flex-1 flex-col gap-1.5">
            <span className="label">Notes on this track</span>
            <textarea
              className="textarea"
              rows={5}
              placeholder="An alt version, a specific vocal lift, a section to skip — anything we should know."
              value={track.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
            />
          </label>

          {!isFirst ? (
            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between">
                <span className="label" style={{ marginBottom: 0 }}>
                  Transition into this track
                </span>
                <span className="caption">how the seam should feel</span>
              </span>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Cut, fade, bridge, key-match, beatmatch…"
                value={transitionValue}
                onChange={(e) => onTransitionChange(e.target.value)}
                style={{ borderStyle: "dashed" }}
              />
            </label>
          ) : (
            <div
              className="caption"
              style={{
                padding: "10px 12px",
                background: "var(--paper-deep)",
                border: "1px dashed var(--hairline-strong)",
                borderRadius: "var(--r-md)",
              }}
            >
              First track — no transition in.
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onRemove}
              disabled={!canRemove}
              className="btn btn-ghost btn-sm"
              style={{
                color: canRemove
                  ? "color-mix(in oklch, var(--terra-2) 70%, var(--ink))"
                  : "var(--ink-faint)",
              }}
            >
              Remove track
            </button>
            <span className="caption">
              {track.duration ? `Source: ${formatTime(track.duration)}` : ""}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SourceField({
  track,
  onChange,
}: {
  track: SongComponent;
  onChange: (patch: Partial<SongComponent>) => void;
}) {
  const isYT = !!parseYouTubeId(track.url);
  const isSpotify = /open\.spotify\.com/.test(track.url);
  const sourceLabel = isYT ? "YouTube" : isSpotify ? "Spotify (coming soon)" : "Source link";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="label">{sourceLabel}</span>
        <span className="caption">YouTube · Spotify · SoundCloud (coming)</span>
      </span>
      <div
        className="flex overflow-hidden"
        style={{
          background: "var(--paper)",
          border:
            "1px solid " +
            (isYT
              ? "color-mix(in oklch, var(--accent) 50%, var(--hairline-strong))"
              : "var(--hairline-strong)"),
          borderRadius: "var(--r-md)",
        }}
      >
        <div
          className="inline-flex items-center font-mono uppercase"
          style={{
            padding: "10px 14px",
            background: "var(--paper-deep)",
            color: isYT ? "var(--accent)" : "var(--ink-mute)",
            fontSize: 11,
            letterSpacing: "0.1em",
            borderRight: "1px solid var(--hairline)",
          }}
        >
          {isYT ? "YT" : isSpotify ? "SP" : "↪"}
        </div>
        <input
          className="font-mono"
          placeholder="https://youtu.be/…"
          value={track.url}
          onChange={(e) => onChange({ url: e.target.value })}
          style={{
            flex: 1,
            border: 0,
            outline: 0,
            background: "transparent",
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--ink)",
          }}
        />
      </div>
      {isSpotify ? (
        <span className="caption" style={{ color: "var(--terra-2)" }}>
          Spotify previews land later this month — your link is saved.
        </span>
      ) : null}
    </label>
  );
}
