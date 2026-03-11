import type { Metadata } from 'next';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Authorized Distributors',
    description: `Find authorized ${config.siteName} distributors or learn how to become one. Wholesale pricing available for qualified dealers.`,
  };
}

const distributors = [
  { name: 'Precision Rifle Supply', region: 'Western US' },
  { name: 'Long Range Arms Co.', region: 'Mountain West' },
  { name: 'Patriot Reloading', region: 'Southeast' },
  { name: 'Great Plains Armory', region: 'Midwest' },
  { name: 'Summit Shooting Sports', region: 'Pacific Northwest' },
  { name: 'Liberty Brass & Ammo', region: 'Northeast' },
];

export default async function DistributorsPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="bg-secondary-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Dealer Network
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Authorized Distributors
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            {storeConfig.siteName} products are available through our growing
            network of authorized dealers. Find a distributor near you or inquire
            about joining our dealer program.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Distributor Grid */}
          <section>
            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-8 text-center">
              Our Dealer Network
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {distributors.map((dist) => (
                <div
                  key={dist.name}
                  className="bg-white rounded-2xl border border-secondary-100 p-8 text-center hover:shadow-md transition-shadow"
                >
                  {/* Logo placeholder */}
                  <div className="w-20 h-20 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <svg
                      className="w-10 h-10 text-secondary-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-secondary-800 text-lg mb-1">
                    {dist.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{dist.region}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Map Placeholder */}
          <section>
            <div className="bg-secondary-50 rounded-3xl border border-secondary-100 overflow-hidden">
              <div className="aspect-[21/9] flex items-center justify-center bg-secondary-100">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-secondary-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-secondary-400 text-sm font-medium">
                    Distributor map coming soon
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Distributor CTA */}
          <section className="bg-secondary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Become a Distributor
              </h2>
              <p className="text-secondary-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Interested in carrying {storeConfig.siteName} products? We offer
                competitive wholesale pricing, marketing support, and dedicated
                account management for qualified dealers and retailers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={`mailto:${storeConfig.email}?subject=Distributor%20Inquiry`}
                  className="px-10 py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-colors text-sm uppercase tracking-widest"
                >
                  Apply Now
                </a>
                <a
                  href={storeConfig.phoneHref}
                  className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-sm uppercase tracking-widest border border-white/10"
                >
                  Call Us
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
