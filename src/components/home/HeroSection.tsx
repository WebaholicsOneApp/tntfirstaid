'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParallax } from '~/hooks/useParallax';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background image with parallax */}
      <div className="relative h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] max-h-[800px]">
        <div ref={parallaxRef} className="absolute inset-[-10%]" style={parallaxStyle}>
          <Image
            src="/images/hero-homepage.jpg"
            alt="Alpha Munitions - American Made Alpha Grade"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.3em] uppercase transition-[opacity,transform] duration-700 ${loaded ? 'opacity-100 translate-y-0 hero-shimmer' : 'opacity-0 translate-y-4 text-primary-500'}`}
          >
            <span className="block">American Made.</span>
            <span className="block">Alpha Grade.</span>
          </h1>
          {/* Gold underline — draws left to right */}
          <div
            className={`w-20 h-0.5 bg-primary-500 mt-6 mb-8 ${loaded ? 'animate-draw-line' : 'opacity-0'}`}
          />
          {/* Shop button */}
          <Link
            href="/shop"
            className={`group relative inline-block overflow-hidden border-2 border-primary-500 rounded font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-all duration-700 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {/* Sweep layer */}
            <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
            {/* Text */}
            <span className="relative z-10 text-white transition-colors duration-500 group-hover:text-secondary-900">
              SHOP
            </span>
          </Link>
        </div>
      </div>

    </section>
  );
}
