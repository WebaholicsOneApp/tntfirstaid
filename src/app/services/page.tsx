import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Services",
    description: `${config.siteName} is a product and training company — CPR/First Aid (AHA), OSHA training and documentation, disaster medicine, active shooter training, and more. Call 800-868-4003 for pricing and scheduling.`,
  };
}

// Irregular heart rhythm: normal beat → normal beat → premature (quick) beat →
// compensatory pause → recovery. R-spike positions within a 1500-unit tile.
const BEAT_POSITIONS = [120, 480, 700, 1220];
const PATTERN_WIDTH = 1500;
const PATTERN_TILES = 4;

const EKG_PATH = (() => {
  const beatGlyph = (cx: number) =>
    ` L ${cx - 80} 100` +
    ` Q ${cx - 65} 88 ${cx - 50} 100` +
    ` L ${cx - 20} 100` +
    ` L ${cx - 10} 112` +
    ` L ${cx} 40` +
    ` L ${cx + 10} 138` +
    ` L ${cx + 20} 100` +
    ` L ${cx + 50} 100` +
    ` Q ${cx + 75} 85 ${cx + 100} 100`;

  let d = "M 0 100";
  for (let t = 0; t < PATTERN_TILES; t++) {
    const offset = t * PATTERN_WIDTH;
    for (const pos of BEAT_POSITIONS) {
      d += beatGlyph(pos + offset);
    }
  }
  d += ` L ${PATTERN_WIDTH * PATTERN_TILES} 100`;
  return d;
})();

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

// Pyramid layout: 1 + 2 + 3 + 4 = 10 services
const SERVICE_PYRAMID: string[][] = [
  services.slice(0, 1),
  services.slice(1, 3),
  services.slice(3, 6),
  services.slice(6, 10),
];

export default async function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        {/* ECG paper grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(rgba(227,24,55,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(227,24,55,0.07) 1px, transparent 1px),
              linear-gradient(rgba(227,24,55,0.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(227,24,55,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px, 20px 20px, 100px 100px, 100px 100px",
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)",
          }}
        />
        {/* Heartbeat trace */}
        <div aria-hidden className="absolute inset-0 flex items-center">
          <svg
            className="h-40 w-full md:h-56"
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
          >
            <g className="animate-ekg-scroll">
              {/* soft glow backer */}
              <path
                d={EKG_PATH}
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.35}
                style={{ filter: "blur(3px)" }}
              />
              {/* sharp phosphor line with pulsing glow */}
              <path
                d={EKG_PATH}
                fill="none"
                stroke="rgba(255,190,200,0.95)"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="animate-ekg-pulse"
              />
            </g>
          </svg>
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.15) 100%)",
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
          <div className="flex flex-col gap-5">
            {SERVICE_PYRAMID.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-col gap-5 lg:flex-row lg:justify-center"
              >
                {row.map((service) => (
                  <article
                    key={service}
                    className="border-secondary-100 group flex w-full items-start gap-4 rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg md:p-7 lg:w-[calc((100%-60px)/4)]"
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
                    <h2 className="font-display text-secondary-900 text-lg leading-snug font-bold break-words">
                      {service}
                    </h2>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom sections — wider than the pyramid so they break out of the max-w-6xl */}
        <div className="mx-auto max-w-7xl">
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
