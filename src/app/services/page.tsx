import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Services",
    description: `${config.siteName} is a product and training company — CPR/First Aid (AHA), OSHA training and documentation, disaster medicine, active shooter training, and more. Call 800-868-4003 for pricing and scheduling.`,
  };
}

const services = [
  "First-Aid Product Sales",
  "CPR/First Aid Training — American Heart Association",
  "OSHA Written Documents and Programs",
  "Tool Box Talks",
  "OSHA Safety Inspections / OSHA Training Courses",
  "Safety Products",
  "Emergency Planning for Homes and Businesses",
  "16-Hour Disaster Medicine Training Course",
  "Active Shooter Training Course",
  "Mass Casualty Disaster Drills",
];

export default async function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/old-site/hero-business-kits.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.75) 40%, rgba(20,6,10,0.5) 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                What We Offer
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              Services
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              TNT First-Aid is the best product and training company for all
              of your needs. Our trainers are professionals that work in the
              field of EMS and emergency care.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service}
                className="border-secondary-100 group flex items-start gap-4 rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg md:p-7"
              >
                <div className="bg-primary-500/10 text-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-lg font-bold leading-snug">
                  {service}
                </h2>
              </article>
            ))}
          </div>

          {/* Virtual Medic tie-in */}
          <section className="border-secondary-100 mt-20 overflow-hidden rounded-2xl border bg-white">
            <div className="grid gap-0 md:grid-cols-5">
              <div className="bg-secondary-50 relative flex items-center justify-center p-10 md:col-span-2 md:p-12">
                <div className="text-center">
                  <div className="bg-primary-500/10 text-primary-600 mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                  <p className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                    Virtual Medic
                  </p>
                  <p className="text-secondary-500 mt-2 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Video Library
                  </p>
                </div>
              </div>
              <div className="p-10 md:col-span-3 md:p-12">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-primary-600 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Also Available
                  </span>
                </div>
                <h2 className="font-display text-secondary-900 mb-3 text-2xl font-bold md:text-3xl">
                  Virtual Medic Video Library
                </h2>
                <p className="text-secondary-600 mb-5 text-sm leading-relaxed">
                  Alongside our in-person training, we developed Virtual
                  Medic — a video-based first aid resource, also available
                  in American Sign Language.
                </p>
                <Link
                  href="/training-videos"
                  className="bg-secondary-900 text-white hover:bg-secondary-800 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-colors active:scale-[0.98]"
                >
                  Browse the Library
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-secondary-950 relative mt-12 overflow-hidden rounded-2xl p-10 text-center md:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 30%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(227,24,55,0.12) 0%, transparent 55%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display mb-4 text-3xl font-bold text-white md:text-4xl">
                Pricing &amp; Scheduling
              </h2>
              <p className="text-secondary-300 mx-auto mb-8 max-w-lg">
                Call for pricing on first-aid training and to schedule your
                session.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="tel:8008684003"
                  className="group bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-3 rounded-full px-7 py-3 font-mono text-[0.8rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  800-868-4003
                </a>
                <Link
                  href="/contact"
                  className="border-primary-500/40 text-primary-400 hover:border-primary-500 hover:text-primary-300 inline-flex items-center rounded-full border px-7 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
