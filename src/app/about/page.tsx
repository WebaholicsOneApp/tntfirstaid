import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'About Us',
    description: `Learn about ${config.siteName} — precision ammunition and reloading components manufactured in the USA.`,
  };
}

const values = [
  {
    title: 'Precision',
    description:
      'Every round we produce is held to exacting tolerances. Our OCD Technology ensures dimensional consistency that competitive shooters and hunters demand.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description:
      'From our proprietary OCD brass processing to custom reamer designs, we never stop pushing the boundaries of what precision components can achieve.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'American Made',
    description:
      'All of our products are manufactured right here in the United States. We source domestically whenever possible and take pride in supporting American industry.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21V3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ),
  },
];

export default async function AboutPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="bg-secondary-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            About {storeConfig.siteName}
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            Precision-engineered ammunition and reloading components for
            competitive shooters, hunters, and long-range enthusiasts.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-24">
          {/* Company Story */}
          <section>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-800 mb-8">
              Built on a Foundation of Precision
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                {storeConfig.siteName} was founded with a single mission: to
                produce the most consistent, accurate ammunition and reloading
                components available. What started as a small operation driven by
                a passion for long-range shooting has grown into a trusted name
                among competitive marksmen and serious hunters across the
                country.
              </p>
              <p>
                Our proprietary OCD (Obsessive Cartridge Disorder) Technology
                represents years of research and development in brass processing
                and case preparation. Every piece of brass that leaves our
                facility has been individually inspected, sorted by weight, and
                processed to tolerances that most manufacturers consider
                unnecessary. We consider them essential.
              </p>
              <p>
                From our facility in American Fork, Utah, we produce premium
                brass, precision reamers, and signature ammunition lines that
                have earned the trust of competitive shooters at the highest
                levels. We believe that when the shot matters most, your
                components should never be the variable.
              </p>
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-800 mb-10 text-center">
              What Drives Us
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-secondary-50 rounded-2xl p-8 border border-secondary-100 text-center"
                >
                  <div className="w-16 h-16 bg-primary-500/10 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-secondary-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-secondary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Experience the Difference?
              </h2>
              <p className="text-secondary-300 mb-8 max-w-lg mx-auto">
                Explore our precision brass, reamers, and signature ammunition
                lines built for shooters who demand the best.
              </p>
              <Link
                href="/shop"
                className="inline-block px-10 py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-colors text-sm uppercase tracking-widest"
              >
                Shop Now
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
