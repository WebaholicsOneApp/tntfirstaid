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
      'Every Alpha case features precision-drilled flash holes that are centered and deburred. This attention to detail ensures consistent ignition and contributes to the extreme accuracy our brass is known for.',
    left: '9.3%',
    top: '48%',
    direction: 'right',
  },
  {
    id: 'internal-volumes',
    title: 'Internal Volumes',
    description:
      'Case-to-case consistency in internal volume is what separates premium brass from the rest. Our proprietary manufacturing process delivers industry-leading uniformity in H2O capacity.',
    left: '52.5%',
    top: '46%',
    direction: 'above',
  },
  {
    id: 'neck-tension',
    title: 'Neck Tension',
    description:
      'Consistent neck tension is the foundation of precision ammunition. Alpha brass is manufactured to exacting tolerances, ensuring uniform neck wall thickness and concentricity for every case.',
    left: '89%',
    top: '46%',
    direction: 'left',
  },
];

export default function OcdTechnologySection() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  }, []);

  const activeData = hotspots.find((h) => h.id === activeHotspot);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Bullet image with hotspots */}
          <AnimateIn animation="slide-right">
            <div className="relative" style={{ aspectRatio: '1946 / 704' }}>
              <Image
                src="/images/bullet-side-homepage.jpg"
                alt="Alpha Munitions brass cartridge cutaway showing precision engineering"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Hotspot markers */}
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

            {/* Mobile: active hotspot content below image */}
            <div className="lg:hidden mt-4 min-h-[100px]">
              {activeData ? (
                <div className="rounded-lg border-t-2 border-primary-500 bg-secondary-50 p-4 animate-slide-up">
                  <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-primary-700 mb-2">
                    {activeData.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-secondary-600">
                    {activeData.description}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-secondary-400">
                  Tap a + marker to learn more
                </p>
              )}
            </div>
          </AnimateIn>

          {/* Right: OCD Content */}
          <AnimateIn animation="fade-up" delay={150}>
            <div>
              {/* OCD logo image */}
              <div className="mb-6">
                <Image
                  src="/images/ocd-logo.jpg"
                  alt="OCD - Optimized Case Design"
                  width={942}
                  height={300}
                  className="w-full max-w-[400px]"
                />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary-800 leading-tight">
                Alpha Munitions Ultra Premium Rifle Brass with OCD (Optimized Case Design)
                Technology.
              </h2>

              <ul className="mt-6 space-y-4 text-secondary-600 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    OCD Technology is the first major advancement in brass manufacturing in decades.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    OCD brass is the strongest most durable rifle brass ever produced giving shooters
                    the widest performance envelope.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-500 mt-1 flex-shrink-0">&#9679;</span>
                  <span>
                    In testing, OCD brass plastically deforms less than competitors at identical
                    loads resulting in better consistency, brass life and performance in all
                    environmental conditions.
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
