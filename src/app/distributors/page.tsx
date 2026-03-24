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
  address?: string;
  phone?: string;
  email?: string;
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
      { name: 'A Team', address: '81 Highway 854, Rayville, LA 71269', phone: '318-372-3264', website: 'https://ateamprecisionshooting.com' },
      { name: 'Altus', address: '8345 Martinsville Fork Rd, Baker, FL 32531', email: 'info@altusshooting.com', website: 'https://altusshooting.com' },
      { name: 'Blue Collar Reloading', address: '1016 S Main St, Salisbury, NC 28147', phone: '(704) 636-2756', website: 'https://bluecollarreloading.com' },
      { name: 'Brownells', address: '3006 Brownells Parkway, Grinnell, IA 50112', phone: '1 (800) 741-0015', website: 'https://brownells.com' },
      { name: "Bruno's", address: '23628 N Central Ave #4, Phoenix, AZ 85024', phone: '(623) 587-7841', website: 'https://brunoshooters.com' },
      { name: 'Bullet Central, LLC', address: '5123 Page Drive S, Fargo, ND 58103', phone: '(701) 371-4444', website: 'https://bulletcentral.com' },
      { name: 'Chattanooga Shooting Supply', address: '2600 Walker Rd, Chattanooga, TN 37421', phone: '(800) 251-4608', website: 'https://chattanoogashooting.com' },
      { name: 'Clays Cartridge', address: 'P.O Box 21589, Oklahoma City, OK 73156', phone: '580-821-2418', email: 'alphamunitions@gmail.com', website: 'https://clayscartridgecompany.com' },
      { name: 'Duck Creek Sporting Goods', address: 'Westminster, CO', phone: '303-254-8998', email: 'dave@duckcreeksportinggoods.com', website: 'https://duckcreeksportinggoods.com' },
      { name: 'Drifters Gear', address: 'PO BOX 484, Palm City, FL 34991', phone: '(772) 708-2063', website: 'https://driftersgear.com' },
      { name: 'GA Precision', address: '1141 Swift St, North Kansas City, MO 64116', phone: '(816) 221-1844', website: 'https://gaprecision.net' },
      { name: 'Graf & Sons', address: '4050 S Clark St, Mexico, MO 65265', phone: '1-800-531-2666', email: 'customerservice@grafs.com', website: 'https://grafs.com' },
      { name: 'Midway', address: 'Columbia, MO', phone: '(800) 243-3220', website: 'https://midwayusa.com' },
      { name: 'Mile High Shooting Accessories', address: '7851 Irene Dr, Frederick, CO 80516', phone: '(303) 258-8996', website: 'https://milehighshooting.com' },
      { name: 'PMA Tool LLC', address: '124 Dieder Dr, Fort Wayne, IN 46825', phone: '260-348-5860', website: 'https://pmatool.com' },
      { name: 'Precision Reloading', address: '1710 W Cedar Ave, Mitchell, SD 57301', phone: '1-800-223-0900', website: 'https://precisionreloading.com' },
      { name: 'Whidden Gunworks', address: '2234 West Watson Rd, Nashville, GA 31639', phone: '(229) 686-1611', website: 'https://whiddengunworks.com' },
      { name: 'Natchez Shooting & Outdoors', address: '2951 Walker Road, Chattanooga, TN 37421', phone: '800-251-7839', website: 'https://natchezss.com' },
    ],
  },
  {
    country: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    distributors: [
      { name: 'C2 Precision', address: 'Unit 1 Kingmill Industrial Estate, Bude, Cornwall EX23 8QN', phone: '01288 358779', email: 'sales@c2precision.co.uk', website: 'https://c2precision.co.uk' },
    ],
  },
  {
    country: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    distributors: [
      { name: 'Bighorn Sales', address: '#17 8645 Dline Road, Houston, BC V0J 1Z2', phone: '(250) 845-2331', email: 'bighorn.hunting@gmail.com' },
      { name: 'Go Big Tactical', address: 'PO BOX 51211, RPO Hart, Prince George, BC V2N7Y1', phone: '250-562-0860', website: 'https://gobigtactical.ca' },
      { name: 'Nechako Outdoors', address: '15809 1 St, Vanderhoof, BC V0J 3A0', phone: '1-250-567-9860', website: 'https://nechakooutdoors.ca' },
    ],
  },
  {
    country: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    distributors: [
      { name: 'APRS', address: '11 Watson St, Hindmarsh, SA 5007', website: 'https://aprsrifles.com.au' },
      { name: 'Maxord Precision Rifle Systems', address: 'Australia', phone: '+61 406 577 276', email: 'sales@maxord.com.au', website: 'https://maxord.com.au' },
    ],
  },
  {
    country: 'New Zealand',
    flag: '\u{1F1F3}\u{1F1FF}',
    distributors: [
      { name: 'Ozark Outdoors', address: 'New Zealand', phone: '(21) 486 447', website: 'https://ozarkoutdoorsnz.co.nz' },
    ],
  },
  {
    country: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    distributors: [
      { name: 'ALPIN Precision', address: 'Gasserbergstra\u00DFe 17, 5244 Oberau', phone: '855-027-2619', website: 'https://alpinprecision.com' },
    ],
  },
  {
    country: 'South Africa',
    flag: '\u{1F1FF}\u{1F1E6}',
    distributors: [
      { name: 'Guns and Bows', address: 'Cnr Fred & Strand Str, Bellville, Cape Town 7530', phone: '(21) 948 3883', website: 'https://gunsbows.co.za' },
    ],
  },
  {
    country: 'Sweden',
    flag: '\u{1F1F8}\u{1F1EA}',
    distributors: [
      { name: 'Corax', address: 'Västerlånggatan 32, 632 23 Eskilstuna', phone: '+46 23 88 81 86', website: 'https://corax-store.se' },
    ],
  },
];

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default async function DistributorsPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <Image
          src="/images/heroes/distributors.jpg"
          alt="Alpha Munitions products"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-primary-400 uppercase">Dealer Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Authorized Distributors</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg">{storeConfig.siteName} products are available through our growing network of authorized dealers worldwide.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Distributor Groups */}
          {distributorsByCountry.map((group) => (
            <section key={group.country}>
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">{group.flag}</span>
                {group.country}
                <span className="text-sm font-normal text-secondary-400">
                  ({group.distributors.length})
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.distributors.map((dist) => (
                  <div
                    key={dist.name}
                    className="bg-white border border-secondary-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <h3 className="font-display font-bold text-secondary-900 text-sm">
                      {dist.name}
                    </h3>

                    {dist.address && (
                      <div className="flex items-start gap-2 text-secondary-500 text-xs">
                        <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-secondary-400" />
                        <span>{dist.address}</span>
                      </div>
                    )}

                    {dist.phone && (
                      <a
                        href={`tel:${dist.phone.replace(/[^+\d]/g, '')}`}
                        className="flex items-center gap-2 text-secondary-500 text-xs hover:text-primary-600 transition-colors"
                      >
                        <PhoneIcon className="w-3.5 h-3.5 flex-shrink-0 text-secondary-400" />
                        <span>{dist.phone}</span>
                      </a>
                    )}

                    {dist.email && (
                      <a
                        href={`mailto:${dist.email}`}
                        className="flex items-center gap-2 text-secondary-500 text-xs hover:text-primary-600 transition-colors"
                      >
                        <EmailIcon className="w-3.5 h-3.5 flex-shrink-0 text-secondary-400" />
                        <span>{dist.email}</span>
                      </a>
                    )}

                    {dist.website && (
                      <a
                        href={dist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-secondary-500 text-xs hover:text-primary-600 transition-colors"
                      >
                        <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0 text-secondary-400" />
                        <span>{dist.website.replace('https://', '')}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Become a Distributor CTA */}
          <section className="bg-secondary-900 p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-primary-500/25" />
            <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-primary-500/25" />
            <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-primary-500/25" />
            <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-primary-500/25" />
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
                  className="group relative inline-block overflow-hidden border border-primary-500 font-mono text-sm tracking-[0.2em] uppercase px-10 py-4"
                >
                  <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                  <span className="relative z-10 text-primary-500 group-hover:text-secondary-900 transition-colors duration-500">Apply Now</span>
                </Link>
                <a
                  href={storeConfig.phoneHref}
                  className="group relative inline-block overflow-hidden border border-white/30 font-mono text-sm tracking-[0.2em] uppercase px-10 py-4"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                  <span className="relative z-10 text-white">Call Us</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
