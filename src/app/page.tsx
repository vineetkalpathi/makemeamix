import Link from "next/link";
import { ArrowIcon } from "./_components/icons";
import { GrooveDisc, PlaceholderVinyl, Vinyl } from "./_components/Vinyl";

const STEPS = [
  {
    idx: "01",
    title: "Share the vision",
    body: "Drop the songs, mark the seconds you love. Tell us the room, the energy, the must-hits.",
    accent: "var(--terra)",
  },
  {
    idx: "02",
    title: "We craft the cut",
    body: "We trim, transition, and tune by ear. Custom intros and bridges if you want them.",
    accent: "var(--mustard)",
  },
  {
    idx: "03",
    title: "Land it in your inbox",
    body: "A polished file ready to press play — refined until it's right, no questions asked.",
    accent: "var(--sage)",
  },
];

const USE_CASES = [
  "Sangeet sets",
  "Wedding dances",
  "Group performances",
  "Sweet sixteens",
  "Late-night drives",
  "Cooking sessions",
  "Workouts",
  "Whatever you've got",
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Mobile/tablet decorative vinyl, clipped at the right edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute lg:hidden"
          style={{
            top: 56,
            right: "clamp(-140px, -22vw, -90px)",
            width: "clamp(240px, 62vw, 360px)",
            height: "clamp(240px, 62vw, 360px)",
            opacity: 0.75,
            zIndex: 1,
          }}
        >
          <PlaceholderVinyl style={{ width: "100%", height: "100%" }} />
        </div>

        <div className="wrap relative z-[2]" style={{ padding: "72px 28px 96px" }}>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-[22px]">
              <span className="eyebrow text-accent">Side A · Track 01</span>
              <h1 style={{ letterSpacing: "-0.02em" }}>
                A mix made
                <br />
                <em className="serif-i text-accent">by hand</em>,
                <br />
                shaped for the moment.
              </h1>
              <p
                className="text-ink-soft m-0 max-w-[520px]"
                style={{ fontSize: 19, lineHeight: 1.55 }}
              >
                Send us your songs, sketch the seams, tell us the room you&apos;re playing it in.
                We build the cut — paced and polished — and drop it in your inbox.
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/craft"
                  className="btn btn-accent"
                  style={{ padding: "14px 24px", fontSize: 15 }}
                >
                  Start your mix <ArrowIcon dir="right" />
                </Link>
                <a
                  href="#how"
                  className="btn btn-ghost"
                  style={{ padding: "14px 22px", fontSize: 15 }}
                >
                  Hear how it works
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-ink-mute text-[13px]">
                <span className="inline-flex items-center gap-2">
                  <Vinyl size={18} /> 7-day turnaround
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--sage)" }}
                  />
                  Unlimited revisions
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--mustard)" }}
                  />
                  Made by humans, not algorithms
                </span>
              </div>
            </div>

            <div className="relative mx-auto hidden aspect-square w-full max-w-[440px] lg:block">
              <PlaceholderVinyl style={{ width: "100%", height: "100%" }} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-10 -z-10"
                style={{ opacity: 0.45 }}
              >
                <GrooveDisc
                  size={520}
                  style={{ position: "absolute", right: -100, top: -60 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="bg-paper-deep"
        style={{
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div className="wrap" style={{ padding: "72px 28px" }}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">How it works</span>
              <h2>Three sides, one record.</h2>
            </div>
            <p className="text-ink-soft m-0 max-w-[360px]">
              Three steps from a playlist of ideas to a polished, performance-ready mix.
            </p>
          </div>

          <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {STEPS.map((step) => (
              <article
                key={step.idx}
                className="card relative"
                style={{ padding: "32px 24px 24px", background: "var(--surface)" }}
              >
                <div
                  className="serif tabular-nums italic"
                  style={{
                    fontSize: 72,
                    lineHeight: 1,
                    color: step.accent,
                    marginBottom: 14,
                  }}
                >
                  {step.idx}
                </div>
                <h3 className="mb-2.5">{step.title}</h3>
                <p
                  className="text-ink-soft m-0"
                  style={{ fontSize: 15, lineHeight: 1.55 }}
                >
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section>
        <div className="wrap" style={{ padding: "72px 28px" }}>
          <div className="mb-9 flex flex-col items-center gap-2 text-center">
            <span className="eyebrow">What it&apos;s for</span>
            <h2>
              For the moments worth&nbsp;
              <em className="serif-i text-accent">scoring</em>.
            </h2>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {USE_CASES.map((t, i) => (
              <div
                key={t}
                className="flex items-center gap-3 border"
                style={{
                  padding: "20px 18px",
                  background: i % 2 === 0 ? "var(--surface)" : "var(--paper-deep)",
                  borderColor: "var(--hairline)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <span
                  className="text-ink-mute font-mono tabular-nums"
                  style={{ fontSize: 10.5, letterSpacing: "0.16em" }}
                >
                  0{i + 1}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <div className="wrap text-center" style={{ padding: "80px 28px" }}>
          <div className="flex flex-col items-center gap-3">
            <span className="eyebrow text-accent">The needle drops</span>
            <h2 className="mx-auto max-w-[720px]" style={{ color: "var(--paper)" }}>
              Bring the songs.
              <br />
              We&apos;ll handle the <em className="serif-i text-accent">seams</em>.
            </h2>
            <Link
              href="/craft"
              className="btn"
              style={{
                marginTop: 18,
                background: "var(--accent)",
                color: "var(--paper)",
                border: "none",
                padding: "16px 28px",
                fontSize: 15,
              }}
            >
              Start your mix <ArrowIcon dir="right" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
