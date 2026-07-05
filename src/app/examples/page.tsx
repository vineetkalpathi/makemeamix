import Link from "next/link";
import { ArrowIcon } from "../_components/icons";
import { EXAMPLE_MIXES } from "./data";
import MixcloudPlayer from "./components/MixcloudPlayer";

export const metadata = {
  title: "Examples — makemeamix",
  description: "Hear what a hand-crafted mix sounds like before you send yours in.",
};

export default function ExamplesPage() {
  return (
    <main className="overflow-x-hidden">
      <section>
        <div className="wrap" style={{ padding: "72px 28px 40px" }}>
          <div className="flex flex-col gap-3">
            <span className="eyebrow text-accent">Side B · Selects</span>
            <h1 style={{ letterSpacing: "-0.02em", fontSize: "clamp(40px, 5.5vw, 72px)" }}>
              Hear the <em className="serif-i text-accent">seams</em>.
            </h1>
            <p className="text-ink-soft m-0 max-w-[560px]" style={{ fontSize: 17, lineHeight: 1.55 }}>
              A few full mixes and transitions, hosted on Mixcloud, so nothing here runs into
              copyright trouble. Press play to hear how we pace a set.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ padding: "0 28px 96px" }}>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            {EXAMPLE_MIXES.map((mix) => (
              <MixcloudPlayer
                key={mix.id}
                feedPath={mix.feedPath}
                title={mix.title}
                artist={mix.artist}
                description={mix.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <div className="wrap text-center" style={{ padding: "72px 28px" }}>
          <div className="flex flex-col items-center gap-3">
            <span className="eyebrow text-accent">Like what you hear?</span>
            <h2 className="mx-auto max-w-[600px]" style={{ color: "var(--paper)" }}>
              Let&apos;s build <em className="serif-i text-accent">yours</em>.
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
