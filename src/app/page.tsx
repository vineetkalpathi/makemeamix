import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_-150px,rgba(99,102,241,0.18),transparent_60%),radial-gradient(1000px_500px_at_10%_20%,rgba(251,191,36,0.12),transparent_60%),#0b0b0f] text-white">
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 sm:px-8 md:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          <span className="text-[10px] font-semibold tracking-[0.18em] text-white/80">HAND‑CRAFTED MIXES</span>
        </div>

        <h1 className="text-center font-extrabold tracking-tight">
          <span className="block text-5xl leading-tight sm:text-6xl md:text-7xl">Need a mix?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-white/80 sm:text-lg">
          Custom mixes, built your way.
        </p>
        <p className="mx-auto mt-4 text-center text-base leading-relaxed text-white/80 sm:text-lg">
          From simple blends to fully structured, performance-ready edits — send your songs and your vision, and we&apos;ll handle the rest.
        </p>
        <p className="mx-auto mt-4 text-center text-base leading-relaxed text-white/80 sm:text-lg">
          Delivered fast.
          Refined until it&apos;s right.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/craft"
            className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition-colors hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Start Your Mix
          </Link>
          <Link
            href="/examples"
            className="inline-flex items-center justify-center rounded-full bg-blue-500/50 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition-colors hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Example mixes
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            How it works
          </a>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[45%] -z-10 flex justify-center opacity-50">
          <div className="h-32 w-[90%] max-w-4xl rounded-full bg-gradient-to-r from-blue-500/30 via-amber-300/30 to-cyan-400/30 blur-2xl" />
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-base font-bold">1. Share your vision</h3>
            <p className="mt-1.5 text-sm text-white/75">Occasion, energy, and any must‑haves. Keep it simple.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-base font-bold">2. We craft the mix</h3>
            <p className="mt-1.5 text-sm text-white/75">Curated with taste. Get funky with a custom intro or transition!</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-base font-bold">3. Delivered straight to your inbox</h3>
            <p className="mt-1.5 text-sm text-white/75">A polished playlist where you want it —ready to press play.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
