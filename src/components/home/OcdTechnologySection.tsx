'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '~/components/ui/AnimateIn';

export default function OcdTechnologySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: OCD Brass image */}
          <AnimateIn animation="slide-right">
            <div className="relative aspect-[4/3] overflow-hidden bg-white">
              <Image
                src="https://alphamunitions.com/wp-content/uploads/2023/02/OCD-Image-Optimized.jpg"
                alt="OCD Technology - Optimized Case Design brass cutaway"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </AnimateIn>

          {/* Right: Content */}
          <AnimateIn animation="fade-up" delay={150}>
            <div>
              {/* OCD logo boxes with decorative lines */}
              <div className="flex items-center gap-2 mb-6">
                {['O', 'C', 'D'].map((letter, i) => (
                  <div key={letter} className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="hidden sm:block w-8 h-px bg-primary-500/40" />
                    )}
                    <span className="inline-flex items-center justify-center w-10 h-10 border-2 border-primary-500 text-primary-500 font-bold text-lg tracking-wider">
                      {letter}
                    </span>
                    {i < 2 ? (
                      <span className="hidden sm:block w-4 h-px bg-primary-500/40" />
                    ) : (
                      <span className="hidden sm:block w-8 h-px bg-primary-500/40" />
                    )}
                  </div>
                ))}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary-800 leading-tight">
                Alpha Munitions Ultra Premium Rifle Brass with OCD (Optimized Case Design)
                Technology.
              </h2>

              <ul className="mt-6 space-y-4 text-secondary-600 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    Weight sorted to +/- 0.5 grain for extreme lot-to-lot consistency
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    Neck wall thickness uniformity held to .0015&quot; or less TIR (Total
                    Indicated Runout)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    Flash holes are precision drilled and deburred for consistent ignition
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm tracking-wider uppercase transition-colors duration-200 group"
                >
                  LEARN MORE
                  <svg
                    className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
