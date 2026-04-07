"use client";

import Image from "next/image";
import AnimateIn from "~/components/ui/AnimateIn";
import { useInView } from "~/hooks/useInView";

export default function SignaturesSection() {
  const { ref: imgRef, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="relative overflow-hidden bg-white pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <AnimateIn animation="fade-up">
          {/* Eyebrow — centered dash variant */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="bg-primary-500 h-px w-6 shrink-0" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Our Commitment
            </span>
            <div className="bg-primary-500 h-px w-6 shrink-0" />
          </div>

          {/* Pull quote */}
          <blockquote className="mb-6">
            <p className="font-display text-secondary-800 text-3xl leading-snug font-bold italic sm:text-4xl lg:text-[2.75rem]">
              &ldquo;To produce the finest rifle brass available anywhere in the
              world.&rdquo;
            </p>
          </blockquote>

          {/* Attribution */}
          <p className="text-secondary-400 mb-6 font-mono text-[0.62rem] tracking-[0.25em] uppercase">
            — Alpha Munitions, Est. 2014
          </p>

          {/* Gold divider */}
          <div className="via-primary-500 mx-auto mb-8 h-px w-14 bg-gradient-to-r from-transparent to-transparent" />

          <p className="text-secondary-400 mx-auto mb-14 max-w-md text-sm leading-relaxed">
            That commitment drives every decision we make — from the raw
            material we source to the final inspection before your brass ships.
          </p>
        </AnimateIn>

        {/* Signatures — color reveals on scroll */}
        <div ref={imgRef} className="relative mx-auto w-full max-w-sm">
          <Image
            src="https://alphamunitions.com/wp-content/uploads/2025/01/alpha-signatures-1.jpg"
            alt="Alpha Munitions team signatures"
            width={500}
            height={300}
            className="h-auto w-full transition-[filter,opacity] duration-[1200ms] ease-out"
            style={{
              filter: isInView ? "grayscale(0)" : "grayscale(1)",
              opacity: isInView ? 1 : 0.4,
            }}
          />
        </div>
      </div>
    </section>
  );
}
