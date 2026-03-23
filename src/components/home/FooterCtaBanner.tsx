'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '~/components/ui/AnimateIn';
import { useParallax } from '~/hooks/useParallax';

export default function FooterCtaBanner() {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);

  return (
    <section className="relative overflow-hidden">
      {/* Background image of brass casings with parallax */}
      <div className="relative py-24 sm:py-32">
        <div ref={parallaxRef} className="absolute inset-[-10%]" style={parallaxStyle}>
          <Image
            src="/images/cta-brass-casings.jpg"
            alt="Brass casings close-up"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <AnimateIn animation="fade-up">
            {/* Eyebrow */}
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-primary-500/60 uppercase mb-6">
              &#9733; Made in the USA &#9733;
            </p>

            {/* Heading — split for impact */}
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-500 tracking-wide">
              American Made
            </h2>
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-500 tracking-wide mt-1">
              Alpha Grade
            </h2>

            {/* Gold divider */}
            <div className="mx-auto mt-6 h-[1px] w-[80px] bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {/* Badge 1: Quality Guaranteed */}
              <div className="flex flex-col items-center gap-2">
                <svg className="w-7 h-7 text-primary-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="font-mono text-[0.6rem] tracking-[0.15em] text-primary-500/50 uppercase">
                  Quality Guaranteed
                </span>
              </div>

              {/* Badge 2: Match-Grade Precision */}
              <div className="flex flex-col items-center gap-2">
                <svg className="w-7 h-7 text-primary-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span className="font-mono text-[0.6rem] tracking-[0.15em] text-primary-500/50 uppercase">
                  Match-Grade Precision
                </span>
              </div>

              {/* Badge 3: American Made */}
              <div className="flex flex-col items-center gap-2">
                <svg className="w-7 h-7 text-primary-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="font-mono text-[0.6rem] tracking-[0.15em] text-primary-500/50 uppercase">
                  American Made
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="group relative inline-block overflow-hidden border border-primary-500 rounded font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-colors duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                <span className="relative z-10 text-white transition-colors duration-500 group-hover:text-secondary-900">SHOP NOW</span>
              </Link>
              <Link
                href="/contact"
                className="group relative inline-block overflow-hidden border border-primary-500 rounded font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-colors duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                <span className="relative z-10 text-white transition-colors duration-500 group-hover:text-secondary-900">CONTACT US</span>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
