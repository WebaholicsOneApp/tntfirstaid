'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '~/components/ui/AnimateIn';

export default function FooterCtaBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image of brass casings */}
      <div className="relative py-24 sm:py-32">
        <Image
          src="/images/cta-brass-casings.jpg"
          alt="Brass casings close-up"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <AnimateIn animation="fade-up">
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-500 tracking-wide">
              American Made Alpha Grade
            </h2>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="group relative inline-block overflow-hidden border-2 border-primary-500 font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-colors duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                <span className="relative z-10 text-white transition-colors duration-500 group-hover:text-secondary-900">SHOP</span>
              </Link>
              <Link
                href="/news"
                className="group relative inline-block overflow-hidden border-2 border-primary-500 font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-colors duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                <span className="relative z-10 text-white transition-colors duration-500 group-hover:text-secondary-900">NEWS</span>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
