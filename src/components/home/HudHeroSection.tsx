'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { gsap, usePrefersReducedMotion } from '~/hooks/useGSAPAnimation';

const DATA_READOUTS = [
  { position: 'top-left', lines: ['LAT 40.7608\u00B0 N', 'LON 111.8910\u00B0 W'] },
  { position: 'top-right', lines: ['ELEV 4,226 FT', 'BARO 29.92 inHg'] },
  { position: 'bottom-left', lines: ['WIND 3.2 MPH NW', 'HUMIDITY 34%'] },
  { position: 'bottom-right', lines: ['TEMP 68\u00B0F', 'DENSITY ALT 5,102 FT'] },
] as const;

const READOUT_POSITIONS: Record<string, string> = {
  'top-left': 'top-14 left-10',
  'top-right': 'top-14 right-10 text-right',
  'bottom-left': 'bottom-14 left-10',
  'bottom-right': 'bottom-14 right-10 text-right',
};

export default function HudHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Mouse parallax on grid overlay (desktop only)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion || window.innerWidth < 768 || !gridRef.current) return;
      const cx = (e.clientX / window.innerWidth - 0.5) * -2;
      const cy = (e.clientY / window.innerHeight - 0.5) * -2;
      gsap.to(gridRef.current, {
        x: `${cx}%`,
        y: `${cy}%`,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // GSAP boot sequence
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      // Show everything immediately
      container.querySelectorAll<HTMLElement>('[data-hud]').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 0.0s — hide everything
      gsap.set('[data-hud]', { opacity: 0 });
      gsap.set('[data-hud="corner"]', { opacity: 0 });
      gsap.set('[data-hud="corner-tl"]', { x: -40, y: -40 });
      gsap.set('[data-hud="corner-tr"]', { x: 40, y: -40 });
      gsap.set('[data-hud="corner-bl"]', { x: -40, y: 40 });
      gsap.set('[data-hud="corner-br"]', { x: 40, y: 40 });
      gsap.set('[data-hud="outer-ring"]', { scale: 0 });
      gsap.set('[data-hud="inner-ring"]', { scale: 0 });
      gsap.set('[data-hud="crosshair"]', {
        clipPath: 'inset(50% 50% 50% 50%)',
      });
      gsap.set('[data-hud="center-dot"]', { scale: 0, opacity: 0 });
      gsap.set('[data-hud="hero-text"]', {
        clipPath: 'inset(50% 50% 50% 50%)',
        opacity: 0,
      });
      gsap.set('[data-hud="divider"]', { scaleX: 0, opacity: 0 });
      gsap.set('[data-hud="tagline"]', { opacity: 0 });
      gsap.set('[data-hud="cta"]', { opacity: 0, y: 10 });
      gsap.set('[data-hud="scroll-cue"]', { opacity: 0 });

      // 0.0s — Grid + corners + readouts arrive together
      tl.to('[data-hud="grid"]', { opacity: 1, duration: 0.5 }, 0);
      tl.to('[data-hud^="corner"]', { opacity: 1, x: 0, y: 0, duration: 0.35 }, 0.05);
      tl.to('[data-hud="readout"]', { opacity: 1, duration: 0.25, stagger: 0.05 }, 0.1);

      // 0.25s — Reticle rings scale in simultaneously
      tl.to('[data-hud="outer-ring"]', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }, 0.25);
      tl.to('[data-hud="inner-ring"]', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }, 0.3);

      // 0.5s — Crosshairs + center dot
      tl.to('[data-hud="crosshair"]', { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.35 }, 0.5);
      tl.to('[data-hud="center-dot"]', { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 0.6);

      // 0.7s — Hero text reveals
      tl.to('[data-hud="hero-text"]', { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.7);

      // 1.2s — Divider + tagline
      tl.to('[data-hud="divider"]', { scaleX: 1, opacity: 1, duration: 0.35 }, 1.2);
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
      className="relative h-screen w-full overflow-hidden bg-secondary-950"
    >
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
        className="pointer-events-none absolute left-0 right-0 h-[2px]"
        style={{
          background: 'rgba(233,195,96,0.15)',
          animation: 'hud-scanline 4s linear infinite',
        }}
      />

      {/* -- Corner brackets -- */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
        const pos = {
          tl: 'top-6 left-6',
          tr: 'top-6 right-6',
          bl: 'bottom-6 left-6',
          br: 'bottom-6 right-6',
        }[corner];
        const borders = {
          tl: 'border-t border-l',
          tr: 'border-t border-r',
          bl: 'border-b border-l',
          br: 'border-b border-r',
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
          className={`pointer-events-none absolute ${READOUT_POSITIONS[group.position]} ${
            // Hide top-right and bottom-left on mobile
            (group.position === 'top-right' || group.position === 'bottom-left')
              ? 'hidden md:block'
              : ''
          }`}
        >
          {group.lines.map((line, li) => (
            <p
              key={li}
              data-hud="readout"
              className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-primary-500/40 leading-relaxed"
              style={{ transitionDelay: `${(gi * 2 + li) * 0.15}s` }}
            >
              {line}
            </p>
          ))}
        </div>
      ))}

      {/* -- Targeting reticle (centered) -- */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Outer ring — 280px, rotating */}
        <div
          data-hud="outer-ring"
          className="absolute h-[220px] w-[220px] rounded-full border border-primary-500/10 md:h-[280px] md:w-[280px]"
          style={{
            animation: 'hud-rotate 20s linear infinite',
            left: '50%',
            top: '50%',
          }}
        >
          {/* Dot on ring */}
          <div className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary-500/30" />
        </div>

        {/* Inner ring — 160px */}
        <div
          data-hud="inner-ring"
          className="absolute h-[120px] w-[120px] rounded-full border border-primary-500/[0.06] md:h-[160px] md:w-[160px]"
        />

        {/* Crosshairs — horizontal */}
        <div
          data-hud="crosshair"
          className="absolute h-[1px] w-[220px] md:w-[280px]"
          style={{
            background:
              'linear-gradient(90deg, rgba(233,195,96,0.1) 0%, rgba(233,195,96,0.1) 35%, transparent 35%, transparent 65%, rgba(233,195,96,0.1) 65%, rgba(233,195,96,0.1) 100%)',
          }}
        />
        {/* Crosshairs — vertical */}
        <div
          data-hud="crosshair"
          className="absolute h-[220px] w-[1px] md:h-[280px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(233,195,96,0.1) 0%, rgba(233,195,96,0.1) 35%, transparent 35%, transparent 65%, rgba(233,195,96,0.1) 65%, rgba(233,195,96,0.1) 100%)',
          }}
        />

        {/* Center dot with glow */}
        <div
          data-hud="center-dot"
          className="absolute h-1 w-1 rounded-full bg-primary-500"
          style={{
            boxShadow:
              '0 0 6px 2px rgba(233,195,96,0.4), 0 0 20px 6px rgba(233,195,96,0.15)',
          }}
        />
      </div>

      {/* -- Hero text -- */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Eyebrow */}
        <div data-hud="hero-text">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-primary-500/70 mb-4 md:mb-6">
            {'// Alpha Munitions Command //'}
          </p>
        </div>

        {/* Heading */}
        <div data-hud="hero-text">
          <h1
            className="font-display text-5xl font-extrabold uppercase tracking-[0.1em] text-primary-500 md:text-7xl lg:text-8xl"
            style={{
              textShadow:
                '0 0 40px rgba(233,195,96,0.25), 0 0 80px rgba(233,195,96,0.1)',
            }}
          >
            <span className="block">ALPHA</span>
            <span className="block">GRADE</span>
          </h1>
        </div>

        {/* Divider */}
        <div
          data-hud="divider"
          className="mt-6 mb-5 h-[1px] w-[100px] origin-left md:mt-8 md:mb-6"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(233,195,96,0.6), transparent)',
          }}
        />

        {/* Tagline */}
        <p
          data-hud="tagline"
          className="font-mono text-xs uppercase tracking-[0.25em] text-primary-400/60 md:text-sm"
        >
          {'Precision \u00B7 Performance \u00B7 Perfection'}
        </p>

        {/* CTA */}
        <Link
          href="/shop"
          data-hud="cta"
          className="group relative mt-8 inline-block overflow-hidden border border-primary-500 rounded px-10 py-3 font-mono text-sm uppercase tracking-widest text-primary-500 transition-colors duration-300 hover:text-secondary-950"
        >
          <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-300 ease-out group-hover:translate-x-0" />
          <span className="relative">Shop Now</span>
        </Link>

        {/* Scroll cue */}
        <p
          data-hud="scroll-cue"
          className="absolute bottom-10 font-mono text-xs uppercase tracking-[0.2em] text-secondary-400"
          style={{ animation: 'hud-pulse 2.5s ease-in-out infinite' }}
        >
          {'\u25BC Scroll to engage \u25BC'}
        </p>
      </div>
    </section>
  );
}
