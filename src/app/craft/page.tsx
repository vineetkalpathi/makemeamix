"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { submitMix } from "./actions";
import type { SongComponent, TransitionNote, SubmitMixState } from "./types";
import UserInfoSection from "./components/UserInfoSection";
import SongCard from "./components/SongCard";
import TransitionNoteCard from "./components/TransitionNoteCard";

const initialState: SubmitMixState = { success: false, message: "" };

export default function CraftPage() {
  const [state, formAction, isPending] = useActionState(submitMix, initialState);
  const bannerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (state.message) {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.message]);

  const [songComponents, setSongComponents] = useState<SongComponent[]>([
    {
      id: crypto.randomUUID(),
      youtubeUrl: "",
      startTime: 0,
      endTime: 30,
      isExpanded: true,
      showWaveform: false,
      notes: "",
    },
  ]);

  const [transitionNotes, setTransitionNotes] = useState<TransitionNote[]>([]);

  const handleSongChange = (id: string, field: string, value: string | number | boolean) => {
    setSongComponents((prev) =>
      prev.map((song) =>
        song.id === id ? { ...song, [field]: value } : song
      )
    );
  };

  const addSongComponent = () => {
    const newId = crypto.randomUUID();
    setSongComponents((prev) =>
      prev
        .map((song) => ({ ...song, isExpanded: false }))
        .concat({
          id: newId,
          youtubeUrl: "",
          startTime: 0,
          endTime: 30,
          isExpanded: true,
          showWaveform: false,
          notes: "",
        })
    );

    if (songComponents.length > 0) {
      setTransitionNotes((prev) =>
        prev.concat({ id: `transition-${newId}`, content: "" })
      );
    }
  };

  const removeSongComponent = (id: string) => {
    setSongComponents((prev) => prev.filter((song) => song.id !== id));
    setTransitionNotes((prev) =>
      prev.filter((note) => note.id !== `transition-${id}`)
    );
  };

  const handleTransitionNoteChange = (id: string, content: string) => {
    setTransitionNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content } : note
      )
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto flex max-w-4xl flex-col px-6 py-12 sm:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            <span className="text-[10px] font-semibold tracking-[0.18em] text-white/80">
              CRAFT YOUR MIX
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Create Your Vision
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-white/80 sm:text-lg">
            Share your details and build your perfect mix with YouTube links and
            transition notes.
          </p>
        </div>

        {/* Status Banner */}
        {state.message && (
          <div
            ref={bannerRef}
            className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {state.message}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-8">
          <UserInfoSection
            errors={state.errors}
            name={name}
            email={email}
            reason={reason}
            onNameChange={setName}
            onEmailChange={setEmail}
            onReasonChange={setReason}
          />

          {/* Hidden inputs for dynamic data */}
          <input type="hidden" name="songs" value={JSON.stringify(songComponents)} />
          <input type="hidden" name="transitions" value={JSON.stringify(transitionNotes)} />

          {/* Song Components */}
          <div className="space-y-6">
            {songComponents.map((song, index) => (
              <div key={song.id} className="space-y-4">
                <SongCard
                  song={song}
                  index={index}
                  canDelete={songComponents.length > 1}
                  onSongChange={handleSongChange}
                  onRemove={removeSongComponent}
                />

                {index < songComponents.length - 1 && (
                  <TransitionNoteCard
                    fromSongIndex={index + 1}
                    toSongIndex={index + 2}
                    content={
                      transitionNotes.find(
                        (note) =>
                          note.id ===
                          `transition-${songComponents[index + 1]?.id}`
                      )?.content || ""
                    }
                    onChange={(content) =>
                      handleTransitionNoteChange(
                        `transition-${songComponents[index + 1]?.id}`,
                        content
                      )
                    }
                  />
                )}
              </div>
            ))}

            {/* Add Song Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={addSongComponent}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(99,102,241,0.45)] transition-colors hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add a song
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition-colors hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Submitting..." : "Submit Your Mix"}
              {!isPending && (
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-x-0 top-[20%] -z-10 flex justify-center opacity-30">
        <div className="h-32 w-[90%] max-w-4xl rounded-full bg-gradient-to-r from-blue-500/20 via-amber-300/20 to-cyan-400/20 blur-2xl" />
      </div>
    </main>
  );
}
