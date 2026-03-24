'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '~/components/ui/AnimateIn';
import { useParallax } from '~/hooks/useParallax';

const badges = [
  { label: 'Quality Guaranteed' },
  { label: 'Match-Grade Precision' },
  { label: 'American Made' },
];

export default function FooterCtaBanner() {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);

  return (
    <section className="relative overflow-hidden">
      {/* Background with parallax */}
      <div className="relative py-28 sm:py-40">
        <div ref={parallaxRef} className="absolute inset-[-10%]" style={parallaxStyle}>
          <Image
            src="/images/cta-brass-casings.jpg"
            alt="Brass casings"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-secondary-950/75" />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <AnimateIn animation="fade-up">

            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-6 bg-primary-500/60 shrink-0" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-primary-400/70 uppercase">
                Made in the USA
              </span>
              <div className="h-px w-6 bg-primary-500/60 shrink-0" />
            </div>

            {/* Headline */}
            <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-400 leading-tight">
              American Made<br />Alpha Grade
            </h2>

            {/* Gold divider */}
            <div className="mx-auto mt-7 mb-8 h-px w-16 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

            {/* Pipe-separated trust line */}
            <p className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mb-12">
              {badges.map((b, i) => (
                <span key={b.label} className="flex items-center gap-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] text-primary-500/60 uppercase">
                    {b.label}
                  </span>
                  {i < badges.length - 1 && (
                    <span className="w-px h-3 bg-primary-500/25" />
                  )}
                </span>
              ))}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Shop Now
                <span className="w-5 h-5 rounded-full bg-secondary-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-primary-500/40 px-8 py-3.5 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase hover:border-primary-500 hover:text-primary-400 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
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
