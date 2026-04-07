"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParallax } from "~/hooks/useParallax";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background image with parallax */}
      <div className="relative h-[60vh] max-h-[800px] min-h-[400px] sm:h-[70vh] sm:min-h-[500px]">
        <div
          ref={parallaxRef}
          className="absolute inset-[-10%]"
          style={parallaxStyle}
        >
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className={`text-3xl font-bold tracking-[0.3em] uppercase transition-[opacity,transform] duration-700 sm:text-4xl md:text-5xl lg:text-6xl ${loaded ? "hero-shimmer translate-y-0 opacity-100" : "text-primary-500 translate-y-4 opacity-0"}`}
          >
            <span className="block">American Made.</span>
            <span className="block">Alpha Grade.</span>
          </h1>
          {/* Gold underline — draws left to right */}
          <div
            className={`bg-primary-500 mt-6 mb-8 h-0.5 w-20 ${loaded ? "animate-draw-line" : "opacity-0"}`}
          />
          {/* Shop button */}
          <Link
            href="/shop"
            className={`group border-primary-500 relative inline-block overflow-hidden rounded border-2 px-12 py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-all delay-400 duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            {/* Sweep layer */}
            <span className="bg-primary-500 absolute inset-0 -translate-x-full transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
            {/* Text */}
            <span className="group-hover:text-secondary-900 relative z-10 text-white transition-colors duration-500">
              SHOP
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
