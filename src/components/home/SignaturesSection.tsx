'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';
import { useInView } from '~/hooks/useInView';

export default function SignaturesSection() {
  const { ref: imgRef, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-32">
      <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <AnimateIn animation="fade-up">

          {/* Eyebrow — centered dash variant */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-6 bg-primary-500 shrink-0" />
            <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
              Our Commitment
            </span>
            <div className="h-px w-6 bg-primary-500 shrink-0" />
          </div>

          {/* Pull quote */}
          <blockquote className="mb-6">
            <p className="font-serif italic text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-secondary-800 leading-snug">
              &ldquo;To produce the finest rifle brass available anywhere in the world.&rdquo;
            </p>
          </blockquote>

          {/* Attribution */}
          <p className="font-mono text-[0.62rem] tracking-[0.25em] text-secondary-400 uppercase mb-6">
            — Alpha Munitions, Est. 2014
          </p>

          {/* Gold divider */}
          <div className="mx-auto h-px w-14 bg-gradient-to-r from-transparent via-primary-500 to-transparent mb-8" />

          <p className="text-secondary-400 text-sm leading-relaxed max-w-md mx-auto mb-14">
            That commitment drives every decision we make — from the raw material we
            source to the final inspection before your brass ships.
          </p>

        </AnimateIn>

        {/* Signatures — color reveals on scroll */}
        <div ref={imgRef} className="relative w-full max-w-sm mx-auto">
          <Image
            src="https://alphamunitions.com/wp-content/uploads/2025/01/alpha-signatures-1.jpg"
            alt="Alpha Munitions team signatures"
            width={500}
            height={300}
            className="w-full h-auto transition-[filter,opacity] duration-[1200ms] ease-out"
            style={{
              filter: isInView ? 'grayscale(0)' : 'grayscale(1)',
              opacity: isInView ? 1 : 0.4,
            }}
          />
        </div>
      </div>
    </section>
  );
}
