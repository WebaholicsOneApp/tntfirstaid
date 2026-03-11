'use client';

import Image from 'next/image';
import AnimateIn from '~/components/ui/AnimateIn';

export default function DataDrivenSection() {
  return (
    <section className="bg-white">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left: Data banner image */}
          <AnimateIn animation="slide-right" className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[350px] lg:min-h-[500px]">
            <Image
              src="https://alphamunitions.com/wp-content/uploads/2019/05/databanner.jpg"
              alt="Shooter at range - Data driven performance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </AnimateIn>

          {/* Right: Content panel */}
          <AnimateIn animation="fade-up" delay={150} className="flex items-center bg-gray-50 p-10 lg:p-16">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-800 leading-tight">
                Data Driven Performance
              </h2>
              <div className="mt-6 space-y-4 text-secondary-500 leading-relaxed">
                <p>
                  At Alpha Munitions, engineering, technology, and innovation are the
                  cornerstones of everything we do. Our commitment to precision begins with
                  advanced manufacturing processes and extends through rigorous quality
                  control testing on every lot we produce.
                </p>
                <p>
                  We leverage data from thousands of rounds tested through chronographs,
                  pressure traces, and accuracy validation to continuously refine our
                  processes and deliver brass that performs at the highest level.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
