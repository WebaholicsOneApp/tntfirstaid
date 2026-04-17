"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/hero/hero-first-aid-group.jpg",
  "/images/hero/hero-cpr-training.jpg",
  "/images/hero/hero-cpr-group.jpg",
  "/images/hero/hero-bandage.jpg",
];

const SLIDE_INTERVAL_MS = 8000;
const FADE_MS = 1400;

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Slideshow layer — cross-fading background images */}
      <div aria-hidden className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 flex items-center justify-center transition-opacity ease-in-out"
            style={{
              opacity: i === activeIdx ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Darkening + brand-tinted overlay — stronger on the left for text readability */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.82) 38%, rgba(20,6,10,0.55) 70%, rgba(30,4,12,0.35) 100%)",
        }}
      />
      {/* Soft red accent at bottom-right for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 85% 90%, rgba(227,24,55,0.18) 0%, transparent 55%)",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-[560px] items-center px-6 py-24 sm:py-28 md:min-h-[640px] md:py-32 lg:py-40 lg:pl-16 xl:pl-24">
        <div className="max-w-2xl text-center md:text-left">
          <div
            className={`mb-5 flex items-center justify-center gap-3 transition-all duration-700 md:justify-start ${loaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          >
            <div className="bg-primary-500/70 h-px w-6" />
            <span className="text-primary-400 text-sm font-semibold tracking-wide uppercase">
              Training &amp; Sales
            </span>
          </div>

          <h1
            className={`font-display text-5xl leading-[1.05] font-bold text-white transition-all delay-75 duration-700 sm:text-6xl md:text-7xl lg:text-8xl ${loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
          >
            <span className="block">First Aid Gear</span>
            <span className="text-primary-500 block">You Can Trust.</span>
          </h1>

          <div
            className={`bg-primary-500 mx-auto mt-7 mb-6 h-0.5 w-16 md:mx-0 ${loaded ? "animate-draw-line" : "opacity-0"}`}
          />

          <p
            className={`text-secondary-200 mx-auto max-w-md text-sm leading-relaxed transition-all delay-200 duration-700 sm:text-base md:mx-0 ${loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.7)" }}
          >
            Professionally curated kits, AEDs, trauma supplies, and hands-on
            CPR &amp; First Aid training — everything you need to be ready
            when seconds matter.
          </p>

          <div
            className={`mt-10 flex flex-col items-center justify-center gap-3 transition-all delay-300 duration-700 sm:flex-row md:justify-start ${loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <Link
              href="/shop"
              className="group bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold uppercase shadow-[0_8px_30px_rgba(227,24,55,0.35)] transition-colors active:scale-[0.98]"
            >
              Shop Now
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </Link>
            <Link
              href="/services"
              className="border-primary-500/60 text-primary-300 hover:border-primary-500 hover:bg-primary-500/10 hover:text-white inline-flex items-center rounded-full border px-7 py-3 text-sm font-semibold uppercase backdrop-blur-sm transition-colors active:scale-[0.98]"
            >
              Book Training
            </Link>
          </div>

          {/* Slide dots */}
          <div
            role="tablist"
            aria-label="Hero slideshow"
            className={`mt-12 flex justify-center gap-2 transition-opacity delay-500 duration-700 md:justify-start ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                onClick={() => setActiveIdx(i)}
                aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
                aria-selected={i === activeIdx}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === activeIdx
                    ? "bg-primary-500 w-8"
                    : "bg-white/30 hover:bg-white/50 w-4"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
