"use client";

import { useEffect, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface YouTubePreviewProps {
  videoId: string;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  isLooping: boolean;
  seekRequest: number;
  setIsPlaying: (v: boolean) => void;
  onTimeChange: (t: number) => void;
  onDurationReady: (d: number) => void;
}

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (s: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

export default function YouTubePreview({
  videoId,
  startTime,
  endTime,
  isPlaying,
  isLooping,
  seekRequest,
  setIsPlaying,
  onTimeChange,
  onDurationReady,
}: YouTubePreviewProps) {
  const playerRef = useRef<YouTube>(null);
  const internalRef = useRef<YTPlayer | null>(null);
  const stateRef = useRef({ startTime, endTime, isLooping });
  const lastSeek = useRef(0);
  const rafRef = useRef<number | null>(null);

  stateRef.current = { startTime, endTime, isLooping };

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
    },
  };

  // Continuous time tick. Started on ready, cleaned up on unmount.
  useEffect(() => {
    const tick = () => {
      const p = internalRef.current;
      if (p) {
        try {
          const t = p.getCurrentTime();
          if (typeof t === "number" && isFinite(t)) {
            onTimeChange(t);
            const { startTime: s, endTime: e, isLooping: l } = stateRef.current;
            if (t >= e) {
              if (l) p.seekTo(s, true);
              else p.pauseVideo();
            }
          }
        } catch {
          // player not ready yet — keep ticking
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onTimeChange]);

  // External play / pause
  useEffect(() => {
    const p = internalRef.current;
    if (!p) return;
    try {
      if (isPlaying) {
        const t = p.getCurrentTime?.() ?? 0;
        if (t < startTime || t > endTime) p.seekTo(startTime, true);
        p.playVideo();
      } else {
        p.pauseVideo();
      }
    } catch {
      // ignore
    }
  }, [isPlaying, startTime, endTime]);

  // External seek
  useEffect(() => {
    if (seekRequest && seekRequest !== lastSeek.current) {
      lastSeek.current = seekRequest;
      try {
        internalRef.current?.seekTo(seekRequest, true);
      } catch {
        // ignore
      }
    }
  }, [seekRequest]);

  const onReady = (event: { target: YTPlayer }) => {
    internalRef.current = event.target;
    try {
      const d = event.target.getDuration() || 0;
      onDurationReady(d);
      event.target.seekTo(startTime, true);
      event.target.pauseVideo();
    } catch {
      // ignore
    }
  };

  const onStateChange = (e: { data: number }) => {
    if (e.data === 1) setIsPlaying(true);
    if (e.data === 2 || e.data === 0) setIsPlaying(false);
  };

  return (
    <div
      className="relative w-full overflow-hidden border bg-black"
      style={{
        aspectRatio: "16 / 9",
        borderRadius: "calc(var(--r-md) + 2px)",
        borderColor: "var(--hairline-strong)",
      }}
    >
      {videoId ? (
        <YouTube
          ref={playerRef}
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="h-full w-full"
          iframeClassName="h-full w-full"
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center font-mono uppercase text-ink-faint"
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
          }}
        >
          <span>paste a link to load preview</span>
        </div>
      )}
    </div>
  );
}

export function parseYouTubeId(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || "";
    if (u.searchParams.get("v")) return u.searchParams.get("v") || "";
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || "";
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || "";
  } catch {
    return "";
  }
  return "";
}
