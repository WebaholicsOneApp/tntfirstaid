'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';

export default function FeatureIconsSection() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Technology */}
          <AnimateIn animation="fade-up" delay={0}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center text-primary-500 mb-5">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-secondary-800 tracking-[0.15em] uppercase mb-4">
                Technology
              </h3>
              <p className="text-secondary-500 text-sm leading-relaxed">
                Alpha Munitions develops cutting-edge manufacturing processes that deliver
                the tightest tolerances in the industry. Our engineering team continuously
                refines our methods to push the boundaries of brass case performance.
              </p>
            </div>
          </AnimateIn>

          {/* Quality — center column with Alpha Grade badge */}
          <AnimateIn animation="fade-up" delay={150}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center text-primary-500 mb-5">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-secondary-800 tracking-[0.15em] uppercase mb-4">
                Quality
              </h3>
              {/* Alpha Grade badge */}
              <div className="my-6 flex justify-center">
                <div className="text-center">
                  <p className="text-primary-500 text-xs font-bold tracking-[0.3em] uppercase">
                    AMERICAN MADE.
                  </p>
                  <Image
                    src="https://alphamunitions.com/wp-content/uploads/2023/02/AlphaGrade.png"
                    alt="Alpha Grade badge"
                    width={200}
                    height={60}
                    className="mx-auto my-2"
                  />
                  <p className="text-primary-500 text-xs font-bold tracking-[0.3em] uppercase">
                    ALPHA GRADE.
                  </p>
                </div>
              </div>
              <p className="text-secondary-500 text-sm leading-relaxed">
                Every lot of Alpha brass is weight sorted, inspected, and tested before it
                ships. We reject what others accept because our reputation is built on
                consistency you can verify at the reloading bench.
              </p>
            </div>
          </AnimateIn>

          {/* Support */}
          <AnimateIn animation="fade-up" delay={300}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center text-primary-500 mb-5">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-secondary-800 tracking-[0.15em] uppercase mb-4">
                Support
              </h3>
              <p className="text-secondary-500 text-sm leading-relaxed">
                Our team of experienced shooters and reloaders is here to help. Whether you
                need load data recommendations, technical support, or just want to talk
                brass, we are always available to assist.
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
