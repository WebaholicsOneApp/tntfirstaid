"use client";

import Image from "next/image";
import Link from "next/link";
import AnimateIn from "~/components/ui/AnimateIn";
import { useParallax } from "~/hooks/useParallax";

const badges = [
  { label: "Quality Guaranteed" },
  { label: "Match-Grade Precision" },
  { label: "American Made" },
];

export default function FooterCtaBanner() {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);

  return (
    <section className="relative overflow-hidden">
      {/* Background with parallax */}
      <div className="relative py-28 sm:py-40">
        <div
          ref={parallaxRef}
          className="absolute inset-[-10%]"
          style={parallaxStyle}
        >
          <Image
            src="/images/cta-brass-casings.jpg"
            alt="Brass casings"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Dark overlay */}
        <div className="bg-secondary-950/75 absolute inset-0" />

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <AnimateIn animation="fade-up">
            {/* Eyebrow */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="bg-primary-500/60 h-px w-6 shrink-0" />
              <span className="text-primary-400/70 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Made in the USA
              </span>
              <div className="bg-primary-500/60 h-px w-6 shrink-0" />
            </div>

            {/* Headline */}
            <h2 className="text-primary-400 font-avenir text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
              American Made
              <br />
              Alpha Grade
            </h2>

            {/* Gold divider */}
            <div className="via-primary-500 mx-auto mt-7 mb-8 h-px w-16 bg-gradient-to-r from-transparent to-transparent" />

            {/* Pipe-separated trust line */}
            <p className="mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {badges.map((b, i) => (
                <span key={b.label} className="flex items-center gap-4">
                  <span className="text-primary-500/60 font-mono text-[0.6rem] tracking-[0.2em] uppercase">
                    {b.label}
                  </span>
                  {i < badges.length - 1 && (
                    <span className="bg-primary-500/25 h-3 w-px" />
                  )}
                </span>
              ))}
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                Shop Now
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
              <Link
                href="/contact"
                className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 hover:text-primary-400 inline-flex items-center rounded-full border px-8 py-3.5 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                Contact Us
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
