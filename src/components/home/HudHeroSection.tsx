"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { gsap, usePrefersReducedMotion } from "~/hooks/useGSAPAnimation";

const DATA_READOUTS = [
  {
    position: "top-left",
    lines: ["LAT 40.7608\u00B0 N", "LON 111.8910\u00B0 W"],
  },
  { position: "top-right", lines: ["ELEV 4,226 FT", "BARO 29.92 inHg"] },
  { position: "bottom-left", lines: ["WIND 3.2 MPH NW", "HUMIDITY 34%"] },
  {
    position: "bottom-right",
    lines: ["TEMP 68\u00B0F", "DENSITY ALT 5,102 FT"],
  },
] as const;

const READOUT_POSITIONS: Record<string, string> = {
  "top-left": "top-14 left-10",
  "top-right": "top-14 right-10 text-right",
  "bottom-left": "bottom-14 left-10",
  "bottom-right": "bottom-14 right-10 text-right",
};

const READOUT_VISIBILITY: Record<string, string> = {
  "top-left": "md:hidden", // Would overlap text block on desktop
  "top-right": "hidden md:block", // Right HUD area only
  "bottom-left": "md:hidden", // Would overlap CTA area on desktop
  "bottom-right": "", // Always visible
};

export default function HudHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoVisible, setVideoVisible] = useState(false);

  // Delay iframe visibility so YouTube's loading UI is hidden before fade-in
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setVideoVisible(true), 1200);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  // Mouse parallax on grid overlay (desktop only)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion || window.innerWidth < 768 || !gridRef.current)
        return;
      const cx = (e.clientX / window.innerWidth - 0.5) * -2;
      const cy = (e.clientY / window.innerHeight - 0.5) * -2;
      gsap.to(gridRef.current, {
        x: `${cx}%`,
        y: `${cy}%`,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // GSAP boot sequence
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      // Show everything immediately
      container.querySelectorAll<HTMLElement>("[data-hud]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 0.0s — hide everything
      gsap.set("[data-hud]", { opacity: 0 });
      gsap.set('[data-hud="corner"]', { opacity: 0 });
      gsap.set('[data-hud="corner-tl"]', { x: -40, y: -40 });
      gsap.set('[data-hud="corner-tr"]', { x: 40, y: -40 });
      gsap.set('[data-hud="corner-bl"]', { x: -40, y: 40 });
      gsap.set('[data-hud="corner-br"]', { x: 40, y: 40 });
      gsap.set('[data-hud="outer-ring"]', { scale: 0 });
      gsap.set('[data-hud="inner-ring"]', { scale: 0 });
      gsap.set('[data-hud="crosshair"]', {
        clipPath: "inset(50% 50% 50% 50%)",
      });
      gsap.set('[data-hud="center-dot"]', { scale: 0, opacity: 0 });
      gsap.set('[data-hud="hero-text"]', {
        clipPath: "inset(0% 100% 0% 0%)",
        opacity: 0,
      });
      gsap.set('[data-hud="divider"]', { scaleX: 0, opacity: 0 });
      gsap.set('[data-hud="american-made"]', { opacity: 0, y: 8 });
      gsap.set('[data-hud="tagline"]', { opacity: 0 });
      gsap.set('[data-hud="cta"]', { opacity: 0, y: 10 });
      gsap.set('[data-hud="scroll-cue"]', { opacity: 0 });

      // 0.0s — Grid + corners + readouts arrive together
      tl.to('[data-hud="grid"]', { opacity: 1, duration: 0.5 }, 0);
      tl.to(
        '[data-hud^="corner"]',
        { opacity: 1, x: 0, y: 0, duration: 0.35 },
        0.05,
      );
      tl.to(
        '[data-hud="readout"]',
        { opacity: 1, duration: 0.25, stagger: 0.05 },
        0.1,
      );

      // 0.25s — Reticle rings scale in simultaneously
      tl.to(
        '[data-hud="outer-ring"]',
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" },
        0.25,
      );
      tl.to(
        '[data-hud="inner-ring"]',
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" },
        0.3,
      );

      // 0.5s — Crosshairs + center dot
      tl.to(
        '[data-hud="crosshair"]',
        { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.35 },
        0.5,
      );
      tl.to(
        '[data-hud="center-dot"]',
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" },
        0.6,
      );

      // 0.7s — Hero text reveals
      tl.to(
        '[data-hud="hero-text"]',
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        0.7,
      );

      // 1.15s — American Made
      tl.to(
        '[data-hud="american-made"]',
        { opacity: 1, y: 0, duration: 0.4 },
        1.15,
      );

      // 1.2s — Divider + tagline
      tl.to(
        '[data-hud="divider"]',
        { scaleX: 1, opacity: 1, duration: 0.35 },
        1.2,
      );
      tl.to('[data-hud="tagline"]', { opacity: 1, duration: 0.35 }, 1.3);

      // 1.4s — CTA button
      tl.to('[data-hud="cta"]', { opacity: 1, y: 0, duration: 0.35 }, 1.4);

      // 1.8s — Scroll cue
      tl.to('[data-hud="scroll-cue"]', { opacity: 1, duration: 0.2 }, 1.8);
    }, container);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="bg-secondary-950 relative min-h-[100dvh] w-full overflow-hidden"
    >
      {/* -- Background video (YouTube, portrait 9:16) -- */}
      {!prefersReducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
          <iframe
            src="https://www.youtube-nocookie.com/embed/nzs_jJTMMBs?autoplay=1&mute=1&loop=1&playlist=nzs_jJTMMBs&controls=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&playsinline=1"
            allow="autoplay; encrypted-media"
            title=""
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
            style={{
              width: "100%",
              height: "max(100%, 177.78vw)",
              border: "none",
              opacity: videoVisible ? 1 : 0,
            }}
          />
        </div>
      )}

      {/* -- Mobile overlay: top-heavy gradient masks YouTube chrome while keeping center content visible -- */}
      <div
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.75) 30%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.70) 75%, rgba(10,10,10,0.88) 100%)",
        }}
      />

      {/* -- Desktop overlay: directional left-to-right for split-text layout -- */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.88) 35%, rgba(10,10,10,0.60) 60%, rgba(10,10,10,0.45) 100%)",
        }}
      />

      {/* Scan-line keyframes + reticle rotation + scroll-cue pulse */}
      <style>{`
        @keyframes hud-scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes hud-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes hud-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* -- Tactical grid overlay -- */}
      <div
        ref={gridRef}
        data-hud="grid"
        className="pointer-events-none absolute inset-[-4%]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,   transparent, transparent 49px, rgba(233,195,96,0.025) 49px, rgba(233,195,96,0.025) 50px),
            repeating-linear-gradient(90deg,  transparent, transparent 49px, rgba(233,195,96,0.025) 49px, rgba(233,195,96,0.025) 50px)
          `,
        }}
      />

      {/* -- Scan line -- */}
      <div
        className="pointer-events-none absolute right-0 left-0 h-[2px]"
        style={{
          background: "rgba(233,195,96,0.15)",
          animation: "hud-scanline 4s linear infinite",
        }}
      />

      {/* -- Corner brackets -- */}
      {(["tl", "tr", "bl", "br"] as const).map((corner) => {
        const pos = {
          tl: "top-6 left-6",
          tr: "top-6 right-6",
          bl: "bottom-6 left-6",
          br: "bottom-6 right-6",
        }[corner];
        const borders = {
          tl: "border-t border-l",
          tr: "border-t border-r",
          bl: "border-b border-l",
          br: "border-b border-r",
        }[corner];
        return (
          <div
            key={corner}
            data-hud={`corner-${corner}`}
            className={`pointer-events-none absolute ${pos} h-10 w-10 ${borders} border-primary-500/25`}
          />
        );
      })}

      {/* -- Data readouts -- */}
      {DATA_READOUTS.map((group, gi) => (
        <div
          key={group.position}
          className={`pointer-events-none absolute ${READOUT_POSITIONS[group.position]} ${READOUT_VISIBILITY[group.position]}`}
        >
          {group.lines.map((line, li) => (
            <p
              key={li}
              data-hud="readout"
              className="text-primary-500/40 font-mono text-[0.6rem] leading-relaxed tracking-[0.15em] uppercase"
              style={{ transitionDelay: `${(gi * 2 + li) * 0.15}s` }}
            >
              {line}
            </p>
          ))}
        </div>
      ))}

      {/* -- Targeting reticle (right half on desktop) -- */}
      <div className="pointer-events-none absolute inset-x-0 inset-y-0 flex items-center justify-center md:left-[44%]">
        {/* Outer ring — 280px, rotating */}
        <div
          data-hud="outer-ring"
          className="border-primary-500/10 absolute h-[220px] w-[220px] rounded-full border md:h-[280px] md:w-[280px]"
          style={{
            animation: "hud-rotate 20s linear infinite",
            left: "50%",
            top: "50%",
          }}
        >
          {/* Dot on ring */}
          <div className="bg-primary-500/30 absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" />
        </div>

        {/* Inner ring — 160px */}
        <div
          data-hud="inner-ring"
          className="border-primary-500/[0.06] absolute h-[120px] w-[120px] rounded-full border md:h-[160px] md:w-[160px]"
        />

        {/* Crosshairs — horizontal */}
        <div
          data-hud="crosshair"
          className="absolute h-[1px] w-[220px] md:w-[280px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(233,195,96,0.1) 0%, rgba(233,195,96,0.1) 35%, transparent 35%, transparent 65%, rgba(233,195,96,0.1) 65%, rgba(233,195,96,0.1) 100%)",
          }}
        />
        {/* Crosshairs — vertical */}
        <div
          data-hud="crosshair"
          className="absolute h-[220px] w-[1px] md:h-[280px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(233,195,96,0.1) 0%, rgba(233,195,96,0.1) 35%, transparent 35%, transparent 65%, rgba(233,195,96,0.1) 65%, rgba(233,195,96,0.1) 100%)",
          }}
        />

        {/* Center dot with glow */}
        <div
          data-hud="center-dot"
          className="bg-primary-500 absolute h-1 w-1 rounded-full"
          style={{
            boxShadow:
              "0 0 6px 2px rgba(233,195,96,0.4), 0 0 20px 6px rgba(233,195,96,0.15)",
          }}
        />
      </div>

      {/* -- Hero text -- */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center md:w-[44%] md:items-start md:px-16 md:text-left lg:px-24">
        {/* Eyebrow */}
        <div data-hud="hero-text">
          <div className="mb-4 flex items-center gap-3 md:mb-6">
            <div className="bg-primary-500/60 h-px w-6" />
            <span
              className="font-avenir text-sm font-medium tracking-[0.3em] uppercase md:text-base"
              style={{ color: "#e9c25f" }}
            >
              Alpha Munitions
            </span>
          </div>
        </div>

        {/* Heading */}
        <div data-hud="hero-text">
          <h1
            className="font-avenir text-primary-500 text-5xl leading-[0.88] font-black tracking-[0.06em] uppercase md:text-7xl lg:text-8xl xl:text-9xl"
            style={{
              textShadow:
                "0 0 40px rgba(233,195,96,0.25), 0 0 80px rgba(233,195,96,0.1)",
            }}
          >
            <span className="block">AMERICAN</span>
            <span className="block">MADE</span>
          </h1>
        </div>

        {/* Secondary headline */}
        <div data-hud="american-made" className="mt-3">
          <p
            className="font-avenir text-2xl font-black tracking-[0.35em] uppercase md:text-3xl lg:text-4xl xl:text-5xl"
            style={{
              WebkitTextStroke: "1px rgba(233,195,96,0.45)",
              color: "transparent",
            }}
          >
            ALPHA GRADE
          </p>
        </div>

        {/* Divider */}
        <div
          data-hud="divider"
          className="mt-6 mb-5 h-[1px] w-[100px] origin-left md:mt-8 md:mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(233,195,96,0.6), transparent)",
          }}
        />

        {/* Tagline */}
        <p
          data-hud="tagline"
          className="text-primary-400/60 font-mono text-xs tracking-[0.25em] uppercase md:text-sm"
        >
          {"Strength \u00B7 Stability \u00B7 Consistency"}
        </p>

        {/* CTA — HUD corner frame button */}
        <Link
          href="/shop"
          data-hud="cta"
          className="group text-primary-500 hover:text-primary-400 relative mt-8 inline-flex items-center gap-4 px-8 py-3.5 font-mono text-sm tracking-widest uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
        >
          {/* Corner brackets */}
          <span className="border-primary-500/50 group-hover:border-primary-500 absolute top-0 left-0 h-3 w-3 border-t border-l transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          <span className="border-primary-500/50 group-hover:border-primary-500 absolute top-0 right-0 h-3 w-3 border-t border-r transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          <span className="border-primary-500/50 group-hover:border-primary-500 absolute bottom-0 left-0 h-3 w-3 border-b border-l transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          <span className="border-primary-500/50 group-hover:border-primary-500 absolute right-0 bottom-0 h-3 w-3 border-r border-b transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          Shop Now
          <svg
            className="h-2.5 w-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </Link>

        {/* Scroll cue */}
        <div
          data-hud="scroll-cue"
          className="absolute bottom-10 flex flex-col items-center gap-2"
          style={{ animation: "hud-pulse 2.5s ease-in-out infinite" }}
        >
          <p className="text-secondary-500 font-mono text-[0.6rem] tracking-[0.25em] uppercase">
            scroll
          </p>
          <svg
            className="text-secondary-500 h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
