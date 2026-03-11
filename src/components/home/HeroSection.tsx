'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="relative h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] max-h-[800px]">
        <Image
          src="/images/hero-homepage.jpg"
          alt="Alpha Munitions - American Made Alpha Grade"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1
            className={`text-primary-500 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.3em] uppercase transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="block">American Made.</span>
            <span className="block">Alpha Grade.</span>
          </h1>
          {/* Gold underline */}
          <div
            className={`w-20 h-0.5 bg-primary-500 mt-6 mb-8 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
          />
          {/* Shop button */}
          <Link
            href="/shop"
            className={`inline-block border-2 border-white text-white hover:bg-white hover:text-secondary-800 font-semibold text-sm tracking-[0.2em] uppercase px-12 py-4 transition-all duration-700 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            SHOP
          </Link>
        </div>
      </div>

      {/* Feature blocks below hero */}
      <div className="bg-secondary-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-secondary-700">
          {[
            {
              title: 'Neck Tension',
              description:
                'Consistent neck tension is the foundation of precision ammunition. Alpha brass is manufactured to exacting tolerances, ensuring uniform neck wall thickness and concentricity for every case.',
            },
            {
              title: 'Internal Volumes',
              description:
                'Case-to-case consistency in internal volume is what separates premium brass from the rest. Our proprietary manufacturing process delivers industry-leading uniformity in H2O capacity.',
            },
            {
              title: 'Flash Holes',
              description:
                'Every Alpha case features precision-drilled flash holes that are centered and deburred. This attention to detail ensures consistent ignition and contributes to the extreme accuracy our brass is known for.',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`px-8 py-8 text-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >
              <h3 className="text-primary-500 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                {item.title}
              </h3>
              <p className="text-secondary-300 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
