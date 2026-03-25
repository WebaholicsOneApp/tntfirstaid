'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import AnimateIn from '~/components/ui/AnimateIn';
import BulletHotspot, { type TooltipDirection } from './BulletHotspot';

interface HotspotData {
  id: string;
  title: string;
  description: string;
  left: string;
  top: string;
  direction: TooltipDirection;
}

const hotspots: HotspotData[] = [
  {
    id: 'flash-holes',
    title: 'Flash Holes',
    description:
      'Our flash holes will always be precisely centered and free of burrs. Flash holes free of burrs have shown lower ES/SD\'s in testing. Extensive testing was also conducted on flash hole size. We consistently saw better performance from the .08" flash holes vs the .062". The .08" flash hole was used to break 8 International Benchrest Shooters (IBS) world records in 2021.',
    left: '9.3%',
    top: '48%',
    direction: 'right',
  },
  {
    id: 'internal-volumes',
    title: 'Internal Volumes',
    description:
      'Our production line and tooling are designed to produce extremely consistent internal volumes. Consistent internal volumes results in extremely consistent velocities.',
    left: '52.5%',
    top: '46%',
    direction: 'above',
  },
  {
    id: 'neck-tension',
    title: 'Neck Tension',
    description:
      'Proper neck tension is key to ensure consistent release of the bullet from the case. Varying neck tension will produce inconsistent bullet velocities which greatly affects a bullets trajectory. We developed proprietary tooling to ensure extremely consistent neck tension.',
    left: '89%',
    top: '46%',
    direction: 'left',
  },
];

const points = [
  'OCD Technology is the first major advancement in brass manufacturing in decades.',
  'OCD brass is the strongest most durable rifle brass ever produced giving shooters the widest performance envelope.',
  'In testing, OCD brass plastically deforms less than competitors at identical loads resulting in better consistency, brass life and performance in all environmental conditions.',
];

export default function OcdTechnologySection() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  }, []);

  const activeData = hotspots.find((h) => h.id === activeHotspot);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Bullet image with hotspots ─────────── */}
          <AnimateIn animation="slide-right">
            <div className="relative" style={{ aspectRatio: '1946 / 704' }}>
              <Image
                src="/images/bullet-side-homepage.jpg"
                alt="Alpha Munitions brass cartridge cutaway showing precision engineering"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {hotspots.map((hotspot, i) => (
                <BulletHotspot
                  key={hotspot.id}
                  title={hotspot.title}
                  description={hotspot.description}
                  direction={hotspot.direction}
                  style={{ left: hotspot.left, top: hotspot.top }}
                  isActive={activeHotspot === hotspot.id}
                  onToggle={() => handleToggle(hotspot.id)}
                  entranceDelay={600 + i * 200}
                />
              ))}
            </div>

            {/* Mobile: active hotspot content */}
            <div className="lg:hidden mt-4 min-h-[100px]">
              {activeData ? (
                <div className="border-l-[3px] border-primary-500 bg-secondary-50 pl-4 py-3 animate-slide-up">
                  <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-primary-700 mb-2">
                    {activeData.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-secondary-500">
                    {activeData.description}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-secondary-300 font-mono tracking-[0.1em]">
                  Tap a + marker to learn more
                </p>
              )}
            </div>
          </AnimateIn>

          {/* ── Right: OCD Content ────────────────────────── */}
          <AnimateIn animation="fade-up" delay={150}>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                OCD Technology
              </span>
            </div>

            {/* OCD logo */}
            <div className="mb-7">
              <Image
                src="/images/ocd-logo.jpg"
                alt="OCD — Optimized Case Design"
                width={942}
                height={300}
                className="w-full max-w-[360px] opacity-90"
              />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight">
              Alpha Munitions Ultra Premium Rifle Brass with OCD (Optimized Case Design) Technology.
            </h2>

            {/* Gold divider */}
            <div className="mt-6 h-px w-14 bg-gradient-to-r from-primary-500 to-transparent" />

            {/* Feature points — gold left border treatment */}
            <ul className="mt-7 space-y-5">
              {points.map((point, i) => (
                <li
                  key={i}
                  className="pl-4 border-l-[2px] border-primary-500/40 text-secondary-400 text-sm leading-relaxed hover:border-primary-500 transition-colors duration-300"
                >
                  {point}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-9">
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Learn More
                <span className="w-5 h-5 rounded-full bg-secondary-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </Link>
            </div>
          </AnimateIn>

        </div>
      </div>
    </section>
  );
}
