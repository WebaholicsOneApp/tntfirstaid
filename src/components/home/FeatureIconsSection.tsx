import Link from "next/link";

const STROKE = "#C8102E";

export default function FeatureIconsSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 md:mb-18">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
              Why TNT First Aid
            </span>
          </div>
          <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            Ready When It Matters Most
          </h2>
        </div>

        <div className="bg-primary-500/20 h-px w-full" />

        <div className="divide-secondary-100 grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Training */}
          <div className="flex flex-col items-center px-10 py-14 text-center">
            <div className="mb-6 flex h-16 items-center justify-center">
              {/* Medical cross with pulse */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
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
            <p className="text-primary-600 mb-3 text-xs font-semibold tracking-wider uppercase">
              Training
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-2xl leading-tight font-bold">
              Hands-On CPR &amp; First Aid Certification
            </h3>
            <p className="text-secondary-600 text-base leading-relaxed">
              Real instructors. Real practice. We teach CPR, AED use,
              Stop&nbsp;the&nbsp;Bleed, and workplace first aid — onsite at
              your facility or ours. Certifications recognized nationwide.
            </p>
          </div>

          {/* Quality */}
          <div className="flex flex-col items-center px-10 py-14 text-center">
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
          <div className="flex flex-col items-center px-10 py-14 text-center">
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
