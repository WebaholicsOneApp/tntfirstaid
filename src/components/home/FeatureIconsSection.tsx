import Link from "next/link";

const STROKE = "#C8102E";

// Hand-tuned bar heights (in px) for the video-library audio visualizer.
// Heights vary 8–24 so the wave reads as organic instead of mechanical.
const AUDIO_BAR_HEIGHTS = [
  8, 14, 20, 24, 16, 10, 22, 18, 12, 24, 20, 14, 22, 16, 24, 18, 12, 20, 14, 8,
];

export default function FeatureIconsSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-12 sm:pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
              Why TNT First Aid
            </span>
          </div>
          <h2 className="font-display text-secondary-900 text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl">
            Ready When It Matters Most
          </h2>
        </div>

        <div className="bg-primary-500/20 h-px w-full" />

        <div className="divide-secondary-100 grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Training — featured */}
          <div className="relative flex flex-col items-center overflow-hidden px-8 pt-12 pb-14 text-center">
            {/* Gradient background — soft red wash with depth */}
            <div
              aria-hidden
              className="from-primary-50 via-primary-50/40 absolute inset-0 -z-10 bg-gradient-to-b to-white"
            />

            {/* Top accent bar */}
            <div
              aria-hidden
              className="bg-primary-500 absolute inset-x-0 top-0 h-[3px]"
            />

            {/* Free + ASL stamp — top-right corner credential */}
            <div
              aria-hidden
              className="absolute top-5 right-5 z-10 hidden sm:block"
            >
              <div className="border-primary-500/60 flex h-16 w-16 -rotate-[10deg] flex-col items-center justify-center rounded-full border-2 bg-white/85 shadow-[0_6px_18px_rgba(227,24,55,0.22)] backdrop-blur-sm">
                <div className="text-primary-700 font-display text-[0.7rem] leading-none font-bold tracking-[0.15em]">
                  FREE
                </div>
                <div className="bg-primary-500 my-1 h-px w-5" />
                <div className="text-primary-600 font-mono text-[0.45rem] leading-none font-semibold tracking-[0.22em] uppercase">
                  + ASL
                </div>
              </div>
            </div>

            {/* Audio waveform visualizer — animated "now playing" rhythm */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-3 flex h-6 items-end justify-center gap-[3px]"
            >
              {AUDIO_BAR_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="bg-primary-500 animate-audio-bar w-[3px] rounded-full"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${(i * 80) % 1400}ms`,
                  }}
                />
              ))}
            </div>

            {/* Icon with subtle red aura */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
              <div
                aria-hidden
                className="bg-primary-500/15 absolute inset-0 -z-10 animate-pulse rounded-full blur-xl"
                style={{ animationDuration: "3s" }}
              />
              <svg width="80" height="80" viewBox="0 0 56 56" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="50"
                  height="50"
                  rx="8"
                  stroke={STROKE}
                  strokeWidth="2.5"
                />
                <path
                  d="M28 14 V42 M14 28 H42"
                  stroke={STROKE}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-primary-700 mb-3 font-mono text-[0.65rem] font-semibold tracking-[0.3em] uppercase">
              Training
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-2xl leading-tight font-bold">
              Free{" "}
              <span className="text-primary-600 italic">CPR &amp; First Aid</span>{" "}
              Video Library
            </h3>
            <p className="text-secondary-700 mb-6 text-base leading-relaxed">
              Step-by-step walkthroughs — burns, bleeding control, CPR, eye
              care, and more. Also available in American Sign Language.
            </p>

            {/* Topic chips */}
            <div className="mb-8 flex flex-wrap justify-center gap-1.5">
              {["BURNS", "BLEEDING", "FRACTURES", "CPR"].map((c) => (
                <span
                  key={c}
                  className="border-primary-500/30 text-primary-800 rounded-full border bg-white/70 px-2.5 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.2em] uppercase"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-auto">
              <Link
                href="/training-videos"
                className="group bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white uppercase shadow-[0_10px_36px_rgba(227,24,55,0.42)] transition-all hover:shadow-[0_14px_44px_rgba(227,24,55,0.55)] active:scale-[0.98]"
              >
                Watch Videos
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quality */}
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="mb-6 flex h-16 items-center justify-center">
              {/* Shield with check */}
              <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
                <path
                  d="M26 2 L48 10 L48 28 C48 42 38 54 26 58 C14 54 4 42 4 28 L4 10 Z"
                  stroke={STROKE}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M15 28 L22 35 L37 20"
                  stroke={STROKE}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-primary-600 mb-3 text-xs font-semibold tracking-wider uppercase">
              Quality
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-2xl leading-tight font-bold">
              Professional-Grade Supplies
            </h3>
            <p className="text-secondary-600 text-base leading-relaxed">
              Every kit is curated by emergency-care professionals. We stock
              trusted brands, check expiration dates, and stand behind every
              product we ship — because OSHA compliance and life-saving gear
              can&apos;t cut corners.
            </p>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="mb-6 flex h-16 items-center justify-center">
              {/* Heart with pulse line */}
              <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
                <path
                  d="M32 46 C32 46 6 32 6 18 C6 10 12 4 20 4 C25 4 29 7 32 12 C35 7 39 4 44 4 C52 4 58 10 58 18 C58 32 32 46 32 46 Z"
                  stroke={STROKE}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M14 24 H22 L25 18 L30 30 L34 22 L38 28 H50"
                  stroke={STROKE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <p className="text-primary-600 mb-3 text-xs font-semibold tracking-wider uppercase">
              Support
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-2xl leading-tight font-bold">
              Real People Who Know First Aid
            </h3>
            <p className="text-secondary-600 mb-8 text-base leading-relaxed">
              Questions about kit restocking, AED maintenance, or training for
              your team? Our staff are certified instructors &mdash; not a
              call center.
            </p>
            <div className="mt-auto">
              <Link
                href="/contact"
                className="group bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98]"
              >
                Get in Touch
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-primary-500/20 h-px w-full" />
      </div>
    </section>
  );
}
