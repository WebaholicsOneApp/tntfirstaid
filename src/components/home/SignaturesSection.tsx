'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';
import { useInView } from '~/hooks/useInView';

export default function SignaturesSection() {
  const { ref: imgRef, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-secondary-200" />
      <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-secondary-200" />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-secondary-200" />
      <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-secondary-200" />

      <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <AnimateIn animation="fade-up">
          {/* Eyebrow */}
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-secondary-400 uppercase mb-6">
            {'// OUR COMMITMENT //'}
          </p>

          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold leading-tight mb-2 text-secondary-800">
            A Word From The Alpha Team
          </h2>

          {/* Gold divider */}
          <div className="mx-auto mt-4 mb-6 h-[1px] w-[60px] bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

          <p className="text-secondary-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Alpha Munitions was founded in 2014 with a singular mission: to produce the
            finest rifle brass available anywhere in the world. That commitment drives every
            decision we make.
          </p>
        </AnimateIn>

        {/* Signatures image — ink-draw reveal */}
        <div ref={imgRef} className="relative w-full max-w-md mx-auto">
          <Image
            src="https://alphamunitions.com/wp-content/uploads/2025/01/alpha-signatures-1.jpg"
            alt="Alpha Munitions team signatures"
            width={500}
            height={300}
            className="w-full h-auto transition-[filter,opacity] duration-1200 ease-out"
            style={{
              filter: isInView ? 'grayscale(0)' : 'grayscale(1)',
              opacity: isInView ? 1 : 0.6,
            }}
          />
        </div>
      </div>
    </section>
  );
}
