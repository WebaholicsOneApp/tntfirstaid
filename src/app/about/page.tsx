import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "About Us",
    description: `Learn about ${config.siteName} — certified first aid training and professional-grade medical supplies for workplaces, schools, and families.`,
  };
}

const STROKE = "currentColor";

const values = [
  {
    title: "Preparedness",
    description:
      "Emergencies don't wait. We help you stock the right gear and train the right people so you're ready before it happens — not scrambling after.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Expertise",
    description:
      "Our instructors are certified emergency responders and healthcare professionals. When you train with us, you learn from people who use these skills for a living.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    title: "Service",
    description:
      "From a single home kit to a nationwide workplace rollout, we treat every customer like the emergency responders they could become.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
];

export default async function AboutPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(227,24,55,0.15) 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Our Story
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              About {storeConfig.siteName}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Life-saving supplies and hands-on training for the people who
              show up first — in workplaces, schools, and homes across the
              country.
            </p>
          </div>
        </div>
      </header>

      <main>
        {/* Who We Are */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Who We Are
                </span>
              </div>
              <h2 className="font-display text-secondary-900 mb-6 text-3xl font-bold md:text-4xl">
                Training meets supply.
              </h2>
              <div className="text-secondary-600 space-y-5 text-lg leading-relaxed">
                <p>
                  TNT First Aid started with a simple observation: the
                  companies selling first aid supplies rarely knew how to use
                  them, and the people teaching first aid rarely had a reliable
                  place to send students for gear. We set out to be both.
                </p>
                <p>
                  Today we equip workplaces, schools, and families with
                  professionally curated first aid kits, AEDs, trauma supplies,
                  and bloodborne pathogen kits &mdash; and we back it all up
                  with nationally recognized CPR, First Aid, AED, and Stop the
                  Bleed training taught by certified instructors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-secondary-50 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
              <div className="border-secondary-100 rounded-2xl border bg-white p-8">
                <div className="bg-primary-500/10 text-primary-600 mb-6 flex h-12 w-12 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-secondary-900 mb-3 text-2xl font-bold">
                  Supplies
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  OSHA-compliant workplace kits, home and family kits, vehicle
                  kits, AEDs, bleed-control stations, burn care, and
                  restocking. We carry trusted brands and stand behind every
                  product we ship.
                </p>
              </div>
              <div className="border-secondary-100 rounded-2xl border bg-white p-8">
                <div className="bg-primary-500/10 text-primary-600 mb-6 flex h-12 w-12 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-secondary-900 mb-3 text-2xl font-bold">
                  Training
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  CPR, First Aid, AED, Bloodborne Pathogens, and Stop the
                  Bleed. On-site at your workplace or scheduled at our
                  training center. Certifications recognized nationwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="relative overflow-hidden py-28 md:py-36">
          <div
            aria-hidden
            className="bg-secondary-950 absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(227,24,55,0.25) 0%, transparent 60%)",
            }}
          />
          <div className="bg-secondary-950 absolute inset-0 -z-10" />
          <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
            <Image
              src="/images/tnt-logo.png"
              alt="TNT First Aid"
              width={100}
              height={100}
              className="mx-auto mb-8"
            />
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="bg-primary-500/60 h-px w-6" />
              <span className="text-primary-400/80 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Our Mission
              </span>
              <div className="bg-primary-500/60 h-px w-6" />
            </div>
            <h2 className="font-display mb-6 text-3xl font-bold text-white md:text-5xl">
              Prepared people save lives.
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed">
              We believe every workplace, classroom, and home should have the
              gear to respond to a medical emergency &mdash; and at least one
              person who knows how to use it. That&rsquo;s the whole point of
              what we do.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  What Drives Us
                </span>
              </div>
              <h2 className="font-display text-secondary-900 text-3xl font-bold md:text-4xl">
                Our Values
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-secondary-50 border-secondary-100 rounded-2xl border p-8 text-center"
                >
                  <div className="bg-primary-500/10 text-primary-600 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded">
                    {value.icon}
                  </div>
                  <h3 className="font-display text-secondary-800 mb-3 text-xl font-bold">
                    {value.title}
                  </h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="bg-secondary-950 relative overflow-hidden rounded-2xl p-10 text-center md:p-16">
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
                  Ready to stock up or train up?
                </h2>
                <p className="text-secondary-300 mx-auto mb-8 max-w-lg">
                  Browse our kits and supplies, or get in touch to schedule
                  on-site CPR and First Aid training for your team.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="group bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="/contact"
                    className="border-primary-500/40 text-primary-400 hover:border-primary-500 hover:text-primary-300 inline-flex items-center rounded-full border px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Book Training
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
