'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';

const stats = [
  { value: '10+', label: 'Years' },
  { value: '47+', label: 'Calibers' },
  { value: '100%', label: 'Lot Tested' },
];

export default function DataDrivenSection() {
  return (
    <section className="bg-white">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">

          {/* ── Left: full-bleed image ───────────────────── */}
          <AnimateIn
            animation="slide-right"
            className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[350px] lg:min-h-[540px] overflow-hidden rounded-3xl"
          >
            <Image
              src="/images/hero-homepage.jpg"
              alt="Shooter at range — Data driven performance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </AnimateIn>

          {/* ── Right: content panel ─────────────────────── */}
          <AnimateIn
            animation="fade-up"
            delay={150}
            className="relative flex items-center bg-white p-10 lg:p-16"
          >
            <div className="w-full">

              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-primary-500 shrink-0" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                  Performance
                </span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight">
                Data Driven Performance
              </h2>

              {/* Gold divider */}
              <div className="mt-5 h-px w-14 bg-gradient-to-r from-primary-500 to-transparent" />

              {/* Stats */}
              <div className="mt-10 mb-10 grid grid-cols-3">
                {stats.map(({ value, label }, i) => (
                  <div
                    key={label}
                    className={`pr-6 ${i > 0 ? 'pl-6 border-l border-secondary-100' : ''}`}
                  >
                    <div className="h-[2px] w-8 bg-primary-500 mb-4" />
                    <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 tabular-nums leading-none">
                      {value}
                    </p>
                    <p className="font-mono text-[0.58rem] tracking-[0.18em] text-secondary-400 uppercase mt-2.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="space-y-4 text-secondary-400 text-sm leading-relaxed">
                <p>
                  At Alpha Munitions, engineering, technology, and innovation are the
                  cornerstones of everything we do. Our commitment to precision begins with
                  advanced manufacturing processes and extends through rigorous quality
                  control testing on every lot we produce.
                </p>
                <p>
                  We leverage data from thousands of rounds tested through chronographs,
                  pressure traces, and accuracy validation to continuously refine our
                  processes and deliver brass that performs at the highest level.
                </p>
              </div>

            </div>
          </AnimateIn>

        </div>
      </div>
    </section>
  );
}
