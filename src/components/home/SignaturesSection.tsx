'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';

export default function SignaturesSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <AnimateIn animation="fade-up">
          <h2
            className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4"
            style={{ color: '#2a6496' }}
          >
            A Word From The Alpha Team
          </h2>
          <p className="text-secondary-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Alpha Munitions was founded in 2014 with a singular mission: to produce the
            finest rifle brass available anywhere in the world. That commitment drives every
            decision we make.
          </p>
        </AnimateIn>

        {/* Signatures image */}
        <AnimateIn animation="fade-in" delay={200}>
          <div className="relative w-full max-w-md mx-auto">
            <Image
              src="https://alphamunitions.com/wp-content/uploads/2025/01/alpha-signatures-1.jpg"
              alt="Alpha Munitions team signatures"
              width={500}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
