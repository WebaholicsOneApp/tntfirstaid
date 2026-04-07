"use client";

import Link from "next/link";
import { useInView } from "~/hooks/useInView";

const EASE = "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]";

export default function FeatureIconsSection() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative overflow-hidden bg-white pb-20 sm:pb-28">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────── */}
        <div
          className={`mb-14 md:mb-18 ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Why Alpha
            </span>
          </div>
          <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            Built to a Higher Standard
          </h2>
        </div>

        {/* ── Top gold rule ──────────────────────────────── */}
        <div className="bg-primary-500/20 h-px w-full" />

        {/* ── Three Equal Columns ────────────────────────── */}
        <div className="divide-secondary-100 grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* ── 01 Technology ──────────────────────────── */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="mb-6 flex h-16 items-center justify-center">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                {/* Outer ring */}
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  stroke="#C9A84C"
                  strokeWidth="2"
                />
                {/* Inner ring */}
                <circle
                  cx="26"
                  cy="26"
                  r="12"
                  stroke="#C9A84C"
                  strokeWidth="2"
                />
                {/* Center dot */}
                <circle cx="26" cy="26" r="3" fill="#C9A84C" />
                {/* Top tick */}
                <line
                  x1="26"
                  y1="4"
                  x2="26"
                  y2="11"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Bottom tick */}
                <line
                  x1="26"
                  y1="41"
                  x2="26"
                  y2="48"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Left tick */}
                <line
                  x1="4"
                  y1="26"
                  x2="11"
                  y2="26"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Right tick */}
                <line
                  x1="41"
                  y1="26"
                  x2="48"
                  y2="26"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-primary-500 mb-2 font-mono text-[0.6rem] tracking-[0.2em] select-none">
              01
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-[0.58rem] tracking-[0.22em] uppercase">
              Technology
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Tightest Tolerances.
              <br />
              Full Stop.
            </h3>
            <p className="text-secondary-400 text-sm leading-relaxed">
              Alpha Munitions develops cutting-edge manufacturing processes that
              deliver the tightest tolerances in the industry. Our engineering
              team continuously refines our methods to push the boundaries of
              brass case performance.
            </p>
          </div>

          {/* ── 02 Quality ─────────────────────────────── */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="mb-6 flex h-16 items-center justify-center">
              <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
                {/* Shield */}
                <path
                  d="M26 2 L48 10 L48 28 C48 42 38 54 26 58 C14 54 4 42 4 28 L4 10 Z"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Check mark */}
                <path
                  d="M15 28 L22 35 L37 20"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-primary-500 mb-2 font-mono text-[0.6rem] tracking-[0.2em] select-none">
              02
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-[0.58rem] tracking-[0.22em] uppercase">
              Quality
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Zero Compromise
              <br />
              in Quality Control.
            </h3>
            <p className="text-secondary-400 text-sm leading-relaxed">
              Every lot of Alpha brass is weight sorted, inspected, and tested
              before it ships. We reject what others accept because our
              reputation is built on consistency you can verify at the reloading
              bench.
            </p>
          </div>

          {/* ── 03 Support ─────────────────────────────── */}
          <div
            className={`flex flex-col items-center px-10 py-14 text-center ${EASE} ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="mb-6 flex h-16 items-center justify-center">
              <svg width="60" height="52" viewBox="0 0 60 52" fill="none">
                {/* Headband arc */}
                <path
                  d="M10 28 C10 14 18 6 30 6 C42 6 50 14 50 28"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Left ear cup */}
                <rect
                  x="4"
                  y="26"
                  width="10"
                  height="16"
                  rx="4"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Right ear cup */}
                <rect
                  x="46"
                  y="26"
                  width="10"
                  height="16"
                  rx="4"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Mic arm */}
                <path
                  d="M14 38 C14 44 20 48 26 48"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Mic tip */}
                <circle cx="26" cy="48" r="2.5" fill="#C9A84C" />
              </svg>
            </div>
            <span className="text-primary-500 mb-2 font-mono text-[0.6rem] tracking-[0.2em] select-none">
              03
            </span>
            <p className="text-secondary-300 mb-4 font-mono text-[0.58rem] tracking-[0.22em] uppercase">
              Support
            </p>
            <h3 className="font-display text-secondary-900 mb-4 text-3xl leading-tight font-bold">
              Expert Support.
              <br />
              Always Here.
            </h3>
            <p className="text-secondary-400 mb-8 text-sm leading-relaxed">
              Our team of experienced shooters and reloaders is here to help.
              Whether you need load data recommendations, technical support, or
              just want to talk brass, we are always available to assist.
            </p>
            <div className="mt-auto">
              <Link
                href="/contact"
                className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                Get in Touch
                <span className="bg-secondary-950/10 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110">
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

        {/* ── Bottom gold rule ───────────────────────────── */}
        <div className="bg-primary-500/20 h-px w-full" />
      </div>
    </section>
  );
}
