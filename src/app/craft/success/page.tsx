import { cookies } from "next/headers";
import Link from "next/link";
import type { SongComponent, TransitionNote } from "../types";

interface MixSubmissionCookie {
  submissionId: string;
  name: string;
  email: string;
  reason: string;
  songs: SongComponent[];
  transitions: TransitionNote[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function CraftSuccessPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mix_submission")?.value;

  let submission: MixSubmissionCookie | null = null;
  if (raw) {
    try {
      submission = JSON.parse(raw) as MixSubmissionCookie;
    } catch {
      // malformed cookie — treat as missing
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 sm:px-8">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
          <svg
            className="h-10 w-10 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          You&apos;re all set!
        </h1>
        <p className="mb-10 text-center text-base text-white/70 sm:text-lg">
          We&apos;ll get to work on your mix.
        </p>

        {/* Submission details */}
        {submission ? (
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-white/90">
              Submission Details
            </h2>

            {/* Contact info */}
            <div className="mb-6 grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Name
                </span>
                <p className="mt-0.5 text-white/90">{submission.name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Email
                </span>
                <p className="mt-0.5 text-white/90">{submission.email}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Occasion
                </span>
                <p className="mt-0.5 text-white/90">{submission.reason}</p>
              </div>
            </div>

            {/* Songs */}
            <div className="mb-6 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Songs
              </span>
              {submission.songs.map((song, index) => {
                const transitionId = `transition-${submission!.songs[index + 1]?.id}`;
                const transition = submission!.transitions.find(
                  (t) => t.id === transitionId
                );
                return (
                  <div key={song.id}>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30 text-xs font-bold text-blue-300">
                          {index + 1}
                        </span>
                        <a
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-blue-300 hover:text-blue-200 hover:underline"
                        >
                          {song.youtubeUrl}
                        </a>
                      </div>
                      <p className="ml-7 text-xs text-white/50">
                        {formatTime(song.startTime)} &ndash; {formatTime(song.endTime)}
                      </p>
                      {song.notes && (
                        <p className="ml-7 mt-1 text-xs text-white/60">
                          {song.notes}
                        </p>
                      )}
                    </div>

                    {transition && transition.content && (
                      <div className="ml-6 mt-1 border-l-2 border-white/10 py-1 pl-4">
                        <p className="text-xs italic text-white/50">
                          Transition: {transition.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission ID */}
            <p className="text-xs text-white/30">
              ID: {submission.submissionId}
            </p>
          </div>
        ) : (
          <p className="text-center text-white/60">
            Your mix has been submitted successfully.
          </p>
        )}

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/craft"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition-colors hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Submit Another Mix
          </Link>
        </div>
      </section>

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-x-0 top-[20%] -z-10 flex justify-center opacity-30">
        <div className="h-32 w-[90%] max-w-4xl rounded-full bg-gradient-to-r from-emerald-500/20 via-blue-300/20 to-cyan-400/20 blur-2xl" />
      </div>
    </main>
  );
}
