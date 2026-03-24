'use client';

import Link from 'next/link';
import { useInView } from '~/hooks/useInView';

const EASE = 'transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]';

export default function FeatureIconsSection() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div
          className={`mb-14 md:mb-18 ${EASE} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center gap-3 mb-7">
            <div className="h-px w-6 bg-primary-500" />
            <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
              Why Alpha
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-secondary-900 leading-tight tracking-tight">
            Built to a<br />
            <em className="not-italic text-primary-600">Higher Standard</em>
          </h2>
        </div>

        {/* ── Top gold rule ──────────────────────────────── */}
        <div className="h-px w-full bg-primary-500/20" />

        {/* ── Three Equal Columns ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-secondary-100">

          {/* ── 01 Technology ──────────────────────────── */}
          <div
            className={`px-10 py-14 flex flex-col items-center text-center ${EASE} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="h-16 flex items-center justify-center mb-6">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                {/* Outer ring */}
                <circle cx="26" cy="26" r="22" stroke="#C9A84C" strokeWidth="2"/>
                {/* Inner ring */}
                <circle cx="26" cy="26" r="12" stroke="#C9A84C" strokeWidth="2"/>
                {/* Center dot */}
                <circle cx="26" cy="26" r="3" fill="#C9A84C"/>
                {/* Top tick */}
                <line x1="26" y1="4" x2="26" y2="11" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                {/* Bottom tick */}
                <line x1="26" y1="41" x2="26" y2="48" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                {/* Left tick */}
                <line x1="4" y1="26" x2="11" y2="26" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                {/* Right tick */}
                <line x1="41" y1="26" x2="48" y2="26" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-primary-500 select-none mb-2">
              01
            </span>
            <p className="font-mono text-[0.58rem] tracking-[0.22em] text-secondary-300 uppercase mb-4">
              Technology
            </p>
            <h3 className="font-display text-3xl font-bold text-secondary-900 leading-tight mb-4">
              Tightest Tolerances.<br />Full Stop.
            </h3>
            <p className="text-sm text-secondary-400 leading-relaxed">
              Alpha Munitions develops cutting-edge manufacturing processes that deliver
              the tightest tolerances in the industry. Our engineering team continuously
              refines our methods to push the boundaries of brass case performance.
            </p>
          </div>

          {/* ── 02 Quality ─────────────────────────────── */}
          <div
            className={`px-10 py-14 flex flex-col items-center text-center ${EASE} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="h-16 flex items-center justify-center mb-6">
              <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
                {/* Shield */}
                <path d="M26 2 L48 10 L48 28 C48 42 38 54 26 58 C14 54 4 42 4 28 L4 10 Z" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                {/* Check mark */}
                <path d="M15 28 L22 35 L37 20" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-primary-500 select-none mb-2">
              02
            </span>
            <p className="font-mono text-[0.58rem] tracking-[0.22em] text-secondary-300 uppercase mb-4">
              Quality
            </p>
            <h3 className="font-display text-3xl font-bold text-secondary-900 leading-tight mb-4">
              Zero Compromise<br />in Quality Control.
            </h3>
            <p className="text-sm text-secondary-400 leading-relaxed">
              Every lot of Alpha brass is weight sorted, inspected, and tested before it
              ships. We reject what others accept because our reputation is built on
              consistency you can verify at the reloading bench.
            </p>
          </div>

          {/* ── 03 Support ─────────────────────────────── */}
          <div
            className={`px-10 py-14 flex flex-col items-center text-center ${EASE} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="h-16 flex items-center justify-center mb-6">
              <svg width="60" height="52" viewBox="0 0 60 52" fill="none">
                {/* Headband arc */}
                <path d="M10 28 C10 14 18 6 30 6 C42 6 50 14 50 28" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Left ear cup */}
                <rect x="4" y="26" width="10" height="16" rx="4" stroke="#C9A84C" strokeWidth="2.5" fill="none"/>
                {/* Right ear cup */}
                <rect x="46" y="26" width="10" height="16" rx="4" stroke="#C9A84C" strokeWidth="2.5" fill="none"/>
                {/* Mic arm */}
                <path d="M14 38 C14 44 20 48 26 48" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Mic tip */}
                <circle cx="26" cy="48" r="2.5" fill="#C9A84C"/>
              </svg>
            </div>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-primary-500 select-none mb-2">
              03
            </span>
            <p className="font-mono text-[0.58rem] tracking-[0.22em] text-secondary-300 uppercase mb-4">
              Support
            </p>
            <h3 className="font-display text-3xl font-bold text-secondary-900 leading-tight mb-4">
              Expert Support.<br />Always Here.
            </h3>
            <p className="text-sm text-secondary-400 leading-relaxed mb-8">
              Our team of experienced shooters and reloaders is here to help. Whether
              you need load data recommendations, technical support, or just want to
              talk brass, we are always available to assist.
            </p>
            <div className="mt-auto">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Get in Touch
                <span className="w-5 h-5 rounded-full bg-secondary-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

        </div>

        {/* ── Bottom gold rule ───────────────────────────── */}
        <div className="h-px w-full bg-primary-500/20" />

      </div>
    </section>
  );
}
