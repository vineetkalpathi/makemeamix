"use client";

import { useState } from "react";
import YouTubePreview from "./YouTubePreview";
import { parseYouTubeUrl, isPotentialYouTubeUrl } from "../../utils/youtube";
import ValidationStatus from "./ValidationStatus";
import type { SongComponent } from "../types";

export default function SongCard({
  song,
  index,
  canDelete,
  onSongChange,
  onRemove,
}: {
  song: SongComponent;
  index: number;
  canDelete: boolean;
  onSongChange: (id: string, field: string, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [showNotes, setShowNotes] = useState(!!song.notes);
  const urlInfo = parseYouTubeUrl(song.youtubeUrl);

  const validationStatus: "valid" | "pending" | "invalid" = urlInfo.isValid
    ? "valid"
    : isPotentialYouTubeUrl(song.youtubeUrl)
      ? "pending"
      : "invalid";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Song {index + 1}</h3>
        {canDelete && (
          <button
            type="button"
            onClick={() => onRemove(song.id)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* YouTube URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-2">
          YouTube Link
        </label>
        <div className="space-y-2">
          <input
            type="url"
            value={song.youtubeUrl}
            onChange={(e) =>
              onSongChange(song.id, "youtubeUrl", e.target.value)
            }
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            placeholder="https://www.youtube.com/watch?v=..."
          />

          {song.youtubeUrl && (
            <div className="flex items-center gap-3">
              <ValidationStatus status={validationStatus} />

              {urlInfo.isValid && (
                <button
                  type="button"
                  onClick={() =>
                    onSongChange(song.id, "showWaveform", !song.showWaveform)
                  }
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {song.showWaveform ? "Hide Waveform" : "Show Waveform"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* YouTube Preview */}
      {urlInfo.isValid && (
        <div className="mb-6">
          <YouTubePreview
            videoId={urlInfo.videoId}
            startTime={song.startTime}
            endTime={song.endTime}
            showWaveform={song.showWaveform}
            onStartTimeChange={(newStartTime) =>
              onSongChange(song.id, "startTime", newStartTime)
            }
            onEndTimeChange={(newEndTime) =>
              onSongChange(song.id, "endTime", newEndTime)
            }
            onTimeUpdate={() => {}}
            onDurationChange={() => {}}
            className="bg-white/[0.02] rounded-lg p-4 border border-white/10"
          />
        </div>
      )}

      {/* Collapsible Notes */}
      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-white/60 hover:text-white/80 transition-colors flex items-center gap-1"
        >
          <svg
            className={`w-3 h-3 transition-transform ${showNotes ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {showNotes ? "Hide notes" : "Add notes"}
        </button>
        {showNotes && (
          <textarea
            value={song.notes}
            onChange={(e) => onSongChange(song.id, "notes", e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            placeholder="Alternate source, trimming instructions, special requests..."
            rows={2}
          />
        )}
      </div>
    </div>
  );
}
