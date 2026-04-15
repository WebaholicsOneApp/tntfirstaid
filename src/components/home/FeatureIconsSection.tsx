"use client";

import Link from "next/link";
import { useInView } from "~/hooks/useInView";

const EASE = "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]";
const STROKE = "#C8102E";

export default function FeatureIconsSection() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative overflow-hidden bg-white pb-20 sm:pb-28">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-14 md:mb-18 ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-xs tracking-[0.3em] uppercase md:text-sm">
              Why TNT First Aid
            </span>
          </div>
          <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            Ready When It Matters Most
          </h2>
        </div>

        <div className="bg-primary-500/20 h-px w-full" />

        <div className="divide-secondary-100 grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* 01 Training */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "100ms" }}
          >
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
            <span className="text-primary-500 mb-2 font-mono text-xs tracking-[0.2em] select-none md:text-sm">
              01
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-xs tracking-[0.22em] uppercase md:text-sm">
              Training
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Hands-On CPR &amp; First Aid Certification
            </h3>
            <p className="text-secondary-400 text-sm leading-relaxed">
              Real instructors. Real practice. We teach CPR, AED use,
              Stop&nbsp;the&nbsp;Bleed, and workplace first aid — onsite at
              your facility or ours. Certifications recognized nationwide.
            </p>
          </div>

          {/* 02 Quality */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
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
            <span className="text-primary-500 mb-2 font-mono text-xs tracking-[0.2em] select-none md:text-sm">
              02
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-xs tracking-[0.22em] uppercase md:text-sm">
              Quality
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Professional-Grade Supplies
            </h3>
            <p className="text-secondary-400 text-sm leading-relaxed">
              Every kit is curated by emergency-care professionals. We stock
              trusted brands, check expiration dates, and stand behind every
              product we ship — because OSHA compliance and life-saving gear
              can&apos;t cut corners.
            </p>
          </div>

          {/* 03 Support */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "300ms" }}
          >
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
            <span className="text-primary-500 mb-2 font-mono text-xs tracking-[0.2em] select-none md:text-sm">
              03
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-xs tracking-[0.22em] uppercase md:text-sm">
              Support
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Real People Who Know First Aid
            </h3>
            <p className="text-secondary-400 mb-8 text-sm leading-relaxed">
              Questions about kit restocking, AED maintenance, or training for
              your team? Our staff are certified instructors &mdash; not a
              call center.
            </p>
            <div className="mt-auto">
              <Link
                href="/contact"
                className="group bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] text-white uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                Get in Touch
                <span className="bg-white/15 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110">
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-primary-500/20 h-px w-full" />
      </div>
    </section>
  );
}
