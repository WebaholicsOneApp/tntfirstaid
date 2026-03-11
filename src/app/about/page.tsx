import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'About Us',
    description: `Learn about ${config.siteName} — a private U.S. company committed to making the best precision rifle brass in the world.`,
  };
}

const values = [
  {
    title: 'Precision',
    description:
      'Every piece of brass is held to exacting tolerances. Our OCD Technology ensures dimensional consistency that competitive shooters and hunters demand.',
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
      'All of our products are manufactured right here in the United States from our state-of-the-art facility in Salt Lake City, Utah.',
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
      {/* Hero with banner background */}
      <header className="relative py-28 md:py-40 overflow-hidden">
        <Image
          src="/images/about/banner.jpg"
          alt="Alpha Munitions facility"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            About {storeConfig.siteName}
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            A private U.S. company committed to making the best precision rifle
            brass in the world.
          </p>
        </div>
      </header>

      <main>
        {/* Who We Are — text left, image right */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-800 mb-8">
                  Who We Are
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Alpha is a private U.S. company committed to making the best
                  precision rifle brass in the world. Our leadership team consists
                  of experienced professionals with backgrounds spanning
                  engineering, pharmaceuticals, medical device, specialty chemicals
                  and specialty operations. We come from professions that are
                  highly technical, tightly regulated, and where quality is never
                  compromised. We have combined our experiences to create an
                  innovative company that strives to deliver unmatched product
                  quality and customer service for the precision shooting
                  community.
                </p>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/about/facility-1.jpg"
                  alt="Alpha Munitions team and facility"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Where We Work — image left, text right */}
        <section className="py-20 md:py-28 bg-secondary-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden md:order-first order-last">
                <Image
                  src="/images/about/facility-2.jpg"
                  alt="Alpha Munitions manufacturing facility"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-800 mb-8">
                  Where We Work
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  We manufacture all of our products in a state of the art
                  facility in Salt Lake City, UT. Our machines utilize the most
                  advanced technologies available in both manufacturing and
                  quality control. Abandoning outdated manufacturing principles
                  and utilizing a laboratory-based, data driven approach ensures
                  Alpha Munitions brass is extremely consistent. Owning this
                  process means we can continually innovate, making better
                  products for the precision shooting community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Do It — text left, image right */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-800 mb-8">
                  Why We Do It
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  We started Alpha Munitions to be different than other brass
                  manufacturers. Along with using the most advanced manufacturing
                  technology in the industry, we wanted to improve the customer
                  experience with the product. From packaging our brass in custom
                  reusable ammo boxes (ensuring every piece arrives free from
                  dents), to ensuring world class dimensional consistency, while
                  offering the highest level of customer service, we are dedicated
                  to providing the best for the precision shooting community.
                </p>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/about/shooting.jpg"
                  alt="Precision shooting with Alpha Munitions"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* American Made — full-width background image */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          <Image
            src="/images/about/american-made.jpg"
            alt="American made precision brass"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Image
              src="/images/alpha-logo.png"
              alt="Alpha Munitions"
              width={80}
              height={80}
              className="mx-auto mb-8 brightness-0 invert opacity-80"
            />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              American Made
            </h2>
            <p className="text-primary-500 text-2xl md:text-3xl font-display font-semibold tracking-wide">
              Alpha Grade
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-6xl">
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
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-secondary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
