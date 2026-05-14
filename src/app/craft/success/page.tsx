import { cookies } from "next/headers";
import Link from "next/link";
import { Vinyl } from "@/app/_components/Vinyl";
import { ArrowIcon } from "@/app/_components/icons";
import type { SongComponent, TransitionNote } from "../types";
import { durationLabel, formatTime } from "../utils/time";
import { trimLink } from "../utils/url";

interface MixSubmissionCookie {
  submissionId: string;
  name: string;
  email: string;
  reason: string;
  songs: SongComponent[];
  transitions: TransitionNote[];
}

export default async function CraftSuccessPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mix_submission")?.value;

  let submission: MixSubmissionCookie | null = null;
  if (raw) {
    try {
      submission = JSON.parse(raw) as MixSubmissionCookie;
    } catch {
      submission = null;
    }
  }

  const totalDuration = submission?.songs.reduce(
    (acc, s) => acc + Math.max(0, s.endTime - s.startTime),
    0
  ) ?? 0;
  const filled = submission?.songs.filter((s) => s.youtubeUrl).length ?? 0;
  const submissionLabel = submission
    ? `MMX-${submission.submissionId.slice(0, 4).toUpperCase()}-A1`
    : "MMX-0000-A1";

  return (
    <main className="wrap" style={{ padding: "60px 28px 80px" }}>
      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* LEFT — vinyl + headline */}
        <div className="flex flex-col gap-4">
          <div className="relative" style={{ width: 220, height: 220 }}>
            <Vinyl size={220} spinning label={`A‑SIDE · ${formatTime(totalDuration)}`} />
            <span
              className="caption absolute"
              style={{
                top: -8,
                left: -10,
                background: "var(--mustard)",
                color: "var(--ink)",
                padding: "4px 10px",
                borderRadius: 999,
                transform: "rotate(-6deg)",
              }}
            >
              Pressing
            </span>
          </div>
          <div>
            <span className="eyebrow text-accent">Submission Confirmed</span>
            <h1 className="mt-3">
              The needle&apos;s <em className="serif-i text-accent">dropping</em>.
            </h1>
          </div>
          <p
            className="text-ink-soft m-0 max-w-[420px]"
            style={{ fontSize: 17, lineHeight: 1.55 }}
          >
            Your mix is queued. We&apos;ll listen, sketch the seams, and send you a first cut
            within 4 days.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/craft" className="btn btn-primary">
              Request another <ArrowIcon dir="right" />
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to home
            </Link>
          </div>
        </div>

        {/* RIGHT — receipt-style submission card */}
        {submission ? (
          <article
            className="card overflow-hidden"
            style={{ padding: 0, background: "var(--surface)" }}
          >
            {/* receipt header */}
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              style={{
                padding: "20px 24px",
                background: "var(--paper-deep)",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="caption">Cue sheet</span>
                <span className="serif-i" style={{ fontSize: 22 }}>
                  {submission.name}&apos;s {submission.reason || "mix"} · side A
                </span>
              </div>
              <span
                className="font-mono tabular-nums text-ink-mute"
                style={{ fontSize: 11 }}
              >
                {submissionLabel}
              </span>
            </div>

            {/* meta */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ borderBottom: "1px solid var(--hairline)" }}
            >
              <ReceiptCell label="Name" value={submission.name} bordered />
              <ReceiptCell label="Email" value={submission.email} bordered />
              <ReceiptCell label="Occasion" value={submission.reason} />
            </div>

            {/* tracks */}
            <div style={{ padding: 8 }}>
              {submission.songs.map((song, i) => {
                const transitionId = `transition-${song.id}`;
                const transition = submission!.transitions.find((t) => t.id === transitionId);
                const dur = Math.max(0, song.endTime - song.startTime);
                return (
                  <div key={song.id}>
                    {transition && transition.content ? (
                      <div
                        className="flex items-center gap-3"
                        style={{ padding: "8px 18px", color: "var(--ink-mute)" }}
                      >
                        <span
                          className="inline-flex items-center justify-center"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "1px dashed var(--accent)",
                            background: "var(--accent-tint)",
                            color: "var(--accent)",
                            fontSize: 12,
                          }}
                        >
                          ✎
                        </span>
                        <span
                          className="serif-i text-ink-soft"
                          style={{ fontSize: 15 }}
                        >
                          {transition.content}
                        </span>
                      </div>
                    ) : null}
                    <div
                      className="flex items-center gap-3"
                      style={{
                        padding: "16px 18px",
                        background: "var(--paper)",
                        border: "1px solid var(--hairline)",
                        borderRadius: "var(--r-md)",
                        margin: 8,
                      }}
                    >
                      <Vinyl size={36} spinning />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span
                          className="truncate"
                          style={{ fontFamily: "var(--font-display)", fontSize: 18 }}
                        >
                          <span
                            className="font-mono tabular-nums text-accent"
                            style={{
                              fontSize: 11,
                              marginRight: 10,
                              letterSpacing: "0.16em",
                            }}
                          >
                            TRACK {String(i + 1).padStart(2, "0")}
                          </span>
                          {song.title || song.youtubeUrl || "Untitled"}
                        </span>
                        <span
                          className="font-mono tabular-nums text-ink-mute"
                          style={{ fontSize: 11 }}
                        >
                          {song.youtubeUrl ? (
                            <a
                              className="hover:underline"
                              href={song.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {trimLink(song.youtubeUrl)}
                            </a>
                          ) : (
                            "—"
                          )}{" "}
                          · {formatTime(song.startTime)} — {formatTime(song.endTime)} ·{" "}
                          {formatTime(dur)}
                        </span>
                        {song.notes ? (
                          <span
                            className="serif-i text-ink-soft mt-1"
                            style={{ fontSize: 14 }}
                          >
                            “{song.notes}”
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* footer */}
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              style={{
                padding: "16px 22px",
                borderTop: "1px solid var(--hairline)",
                background: "var(--paper-deep)",
              }}
            >
              <span
                className="font-mono uppercase text-ink-mute"
                style={{ fontSize: 11, letterSpacing: "0.12em" }}
              >
                Run time · {durationLabel(totalDuration)} across {filled} tracks
              </span>
              <span
                className="font-mono tabular-nums text-ink-mute"
                style={{ fontSize: 11 }}
              >
                ID · {submission.submissionId}
              </span>
            </div>
          </article>
        ) : (
          <article className="card">
            <p className="text-ink-soft" style={{ margin: 0 }}>
              Your mix has been submitted. Check your inbox for confirmation.
            </p>
          </article>
        )}
      </div>
    </main>
  );
}

function ReceiptCell({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col gap-1" +
        (bordered ? " border-b sm:border-b-0 sm:border-r" : "")
      }
      style={{ padding: 18, borderColor: "var(--hairline)" }}
    >
      <span className="caption">{label}</span>
      <span className="break-all" style={{ fontSize: 15 }}>{value || "—"}</span>
    </div>
  );
}

