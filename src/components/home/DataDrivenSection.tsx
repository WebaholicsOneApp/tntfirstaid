"use client";

import Image from "next/image";
import AnimateIn from "~/components/ui/AnimateIn";

const stats = [
  { value: "10+", label: "Years" },
  { value: "47+", label: "Calibers" },
  { value: "100%", label: "Lot Tested" },
];

export default function DataDrivenSection() {
  return (
    <section className="bg-white py-16 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-20">
          {/* ── Left: constrained square image card ───────── */}
          <AnimateIn
            animation="slide-right"
            className="ring-secondary-100 relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-lg ring-1 lg:aspect-auto lg:h-full"
          >
            <Image
              src="/images/hero-homepage.jpg"
              alt="Shooter at range — Data driven performance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </AnimateIn>

          {/* ── Right: content ───────────────────────────── */}
          <AnimateIn animation="fade-up" delay={150} className="w-full">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6 shrink-0" />
              <span className="text-secondary-400 font-mono text-xs tracking-[0.3em] uppercase md:text-sm">
                Performance
              </span>
            </div>

            <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Data Driven Performance
            </h2>

            {/* Gold divider */}
            <div className="from-primary-500 mt-5 h-px w-14 bg-gradient-to-r to-transparent" />

            {/* Stats */}
            <div className="mt-8 mb-8 grid grid-cols-3">
              {stats.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`pr-6 ${i > 0 ? "border-secondary-100 border-l pl-6" : ""}`}
                >
                  <div className="bg-primary-500 mb-4 h-[2px] w-8" />
                  <p className="font-display text-secondary-900 text-3xl leading-none font-bold tabular-nums sm:text-4xl lg:text-5xl">
                    {value}
                  </p>
                  <p className="text-secondary-400 mt-2.5 font-mono text-[0.58rem] tracking-[0.18em] uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="text-secondary-400 space-y-4 text-sm leading-relaxed">
              <p>
                At Alpha Munitions, engineering, technology, and innovation are
                the cornerstones of everything we do. Our commitment to
                precision begins with advanced manufacturing processes and
                extends through rigorous quality control testing on every lot we
                produce.
              </p>
              <p>
                We leverage data from thousands of rounds tested through
                chronographs, pressure traces, and accuracy validation to
                continuously refine our processes and deliver brass that
                performs at the highest level.
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
