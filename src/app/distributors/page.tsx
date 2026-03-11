import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Authorized Distributors',
    description: `Find authorized ${config.siteName} distributors worldwide or learn how to become one.`,
  };
}

interface Distributor {
  name: string;
  location: string;
  website?: string;
}

interface CountryGroup {
  country: string;
  flag: string;
  distributors: Distributor[];
}

const distributorsByCountry: CountryGroup[] = [
  {
    country: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    distributors: [
      { name: 'A Team', location: 'Rayville, LA', website: 'https://ateamprecisionshooting.com' },
      { name: 'Altus', location: 'Baker, FL', website: 'https://altusshooting.com' },
      { name: 'Blue Collar Reloading', location: 'Salisbury, NC', website: 'https://bluecollarreloading.com' },
      { name: 'Brownells', location: 'Grinnell, IA', website: 'https://brownells.com' },
      { name: "Bruno's", location: 'Phoenix, AZ', website: 'https://brunoshooters.com' },
      { name: 'Bullet Central, LLC', location: 'Fargo, ND', website: 'https://bulletcentral.com' },
      { name: 'Chattanooga Shooting Supply', location: 'Chattanooga, TN', website: 'https://chattanoogashooting.com' },
      { name: 'Clays Cartridge', location: 'Oklahoma City, OK', website: 'https://clayscartridgecompany.com' },
      { name: 'Duck Creek Sporting Goods', location: 'Westminster, CO', website: 'https://duckcreeksportinggoods.com' },
      { name: 'Drifters Gear', location: 'Palm City, FL', website: 'https://driftersgear.com' },
      { name: 'GA Precision', location: 'North Kansas City, MO', website: 'https://gaprecision.net' },
      { name: 'Graf & Sons', location: 'Mexico, MO', website: 'https://grafs.com' },
      { name: 'Midway', location: 'Columbia, MO', website: 'https://midwayusa.com' },
      { name: 'Mile High Shooting Accessories', location: 'Frederick, CO', website: 'https://milehighshooting.com' },
      { name: 'Natchez Shooting & Outdoors', location: 'Chattanooga, TN', website: 'https://natchezss.com' },
      { name: 'PMA Tool LLC', location: 'Fort Wayne, IN', website: 'https://pmatool.com' },
      { name: 'Precision Reloading', location: 'Mitchell, SD', website: 'https://precisionreloading.com' },
      { name: 'Whidden Gunworks', location: 'Nashville, GA', website: 'https://whiddengunworks.com' },
    ],
  },
  {
    country: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    distributors: [
      { name: 'Bighorn Sales', location: 'Houston, BC' },
      { name: 'Go Big Tactical', location: 'Prince George, BC', website: 'https://gobigtactical.ca' },
      { name: 'Nechako Outdoors', location: 'Vanderhoof, BC', website: 'https://nechakooutdoors.ca' },
    ],
  },
  {
    country: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    distributors: [
      { name: 'C2 Precision', location: 'Bude, Cornwall', website: 'https://c2precision.co.uk' },
    ],
  },
  {
    country: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    distributors: [
      { name: 'APRS', location: 'Hindmarsh, SA', website: 'https://aprsrifles.com.au' },
      { name: 'Maxord Precision Rifle Systems', location: 'Australia', website: 'https://maxord.com.au' },
    ],
  },
  {
    country: 'New Zealand',
    flag: '\u{1F1F3}\u{1F1FF}',
    distributors: [
      { name: 'Ozark Outdoors', location: 'New Zealand', website: 'https://ozarkoutdoorsnz.co.nz' },
    ],
  },
  {
    country: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    distributors: [
      { name: 'ALPIN Precision', location: 'Oberau', website: 'https://alpinprecision.com' },
    ],
  },
  {
    country: 'South Africa',
    flag: '\u{1F1FF}\u{1F1E6}',
    distributors: [
      { name: 'Guns and Bows', location: 'Cape Town', website: 'https://gunsbows.co.za' },
    ],
  },
  {
    country: 'Sweden',
    flag: '\u{1F1F8}\u{1F1EA}',
    distributors: [
      { name: 'Corax', location: 'Eskilstuna', website: 'https://corax-store.se' },
    ],
  },
];

export default async function DistributorsPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-24 md:py-36 overflow-hidden">
        <Image
          src="/images/heroes/distributors.jpg"
          alt="Alpha Munitions products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Dealer Network
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Authorized Distributors
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            {storeConfig.siteName} products are available through our growing
            network of authorized dealers worldwide.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Distributor Groups */}
          {distributorsByCountry.map((group) => (
            <section key={group.country}>
              <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">{group.flag}</span>
                {group.country}
                <span className="text-sm font-normal text-gray-400">
                  ({group.distributors.length})
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.distributors.map((dist) => (
                  <div
                    key={dist.name}
                    className="bg-white rounded-xl border border-secondary-100 p-5 hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-secondary-800 text-sm truncate">
                        {dist.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {dist.location}
                      </p>
                    </div>
                    {dist.website && (
                      <a
                        href={dist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center text-secondary-400 hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                        aria-label={`Visit ${dist.name} website`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

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
                <Link
                  href="/dealer-sign-up"
                  className="px-10 py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-colors text-sm uppercase tracking-widest"
                >
                  Apply Now
                </Link>
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
