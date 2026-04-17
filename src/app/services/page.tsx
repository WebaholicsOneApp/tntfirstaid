import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Services",
    description: `On-site CPR, AED, First Aid, Bloodborne Pathogens, and Stop the Bleed training from ${config.siteName}. Certified instructors, nationally recognized certifications.`,
  };
}

const services = [
  {
    title: "CPR & AED Certification",
    duration: "3–4 hours",
    audience: "Employees, caregivers, coaches, parents",
    description:
      "Hands-on adult, child, and infant CPR plus AED operation. Participants leave with a 2-year certification card recognized nationwide.",
    bullets: [
      "Single-rescuer and two-rescuer CPR",
      "Automated External Defibrillator (AED) use",
      "Choking rescue (adult, child, infant)",
      "Recovery position & patient handover",
    ],
  },
  {
    title: "Standard First Aid",
    duration: "4–6 hours",
    audience: "Workplaces, schools, community groups",
    description:
      "Practical response to the most common injuries and illnesses — bleeding, burns, fractures, shock, allergic reactions, and more.",
    bullets: [
      "Scene safety and primary assessment",
      "Bleeding control and wound care",
      "Burns, fractures, and sprains",
      "Medical emergencies (stroke, seizure, diabetic)",
    ],
  },
  {
    title: "Bloodborne Pathogens (OSHA)",
    duration: "1–2 hours",
    audience: "Any employee with occupational exposure risk",
    description:
      "OSHA-compliant annual training covering exposure prevention, PPE, and post-exposure procedures. Required under 29 CFR 1910.1030.",
    bullets: [
      "Transmission and exposure routes",
      "Universal precautions and PPE",
      "Exposure control plans",
      "Post-exposure evaluation & follow-up",
    ],
  },
  {
    title: "Stop the Bleed",
    duration: "1.5–2 hours",
    audience: "Teachers, security staff, general public",
    description:
      "Taught nationally under the ACS Stop the Bleed program — tourniquet application, wound packing, and direct pressure for life-threatening bleeding.",
    bullets: [
      "Recognizing life-threatening bleeding",
      "Tourniquet application (hands-on)",
      "Wound packing and direct pressure",
      "Bleeding control kit familiarization",
    ],
  },
  {
    title: "Custom On-Site Training",
    duration: "Varies",
    audience: "Corporations, property managers, schools",
    description:
      "We build the curriculum around your industry, hazards, and team size. Scheduling flexibility for multi-shift workplaces.",
    bullets: [
      "Industry-specific scenarios",
      "Multi-group & multi-shift scheduling",
      "Combined CPR + First Aid certifications",
      "Kit familiarization with your supplies",
    ],
  },
  {
    title: "AED Program Management",
    duration: "Ongoing",
    audience: "Workplaces and facilities with AEDs",
    description:
      "We manage the entire lifecycle — placement, signage, pad and battery tracking, and post-event follow-up so your AEDs are always ready.",
    bullets: [
      "Placement & signage assessment",
      "Pad and battery replacement tracking",
      "Medical direction & state compliance",
      "Post-rescue data download and support",
    ],
  },
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
          className="object-contain"
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
              Training Services
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Nationally recognized CPR, First Aid, AED, and emergency
              response training — delivered by certified instructors at your
              location or ours.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="border-secondary-100 group rounded-2xl border bg-white p-8 transition-shadow hover:shadow-lg md:p-10"
              >
                <h2 className="font-display text-secondary-900 mb-3 text-2xl font-bold">
                  {service.title}
                </h2>
                <div className="mb-5 flex flex-wrap gap-2 text-[0.6rem] tracking-[0.2em] uppercase">
                  <span className="bg-primary-500/10 text-primary-600 rounded-full px-3 py-1 font-mono">
                    {service.duration}
                  </span>
                  <span className="bg-secondary-100 text-secondary-600 rounded-full px-3 py-1 font-mono">
                    {service.audience}
                  </span>
                </div>
                <p className="text-secondary-600 mb-5 text-sm leading-relaxed">
                  {service.description}
                </p>
                <ul className="text-secondary-500 mb-6 space-y-2 text-sm">
                  {service.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <svg
                        className="text-primary-500 mt-0.5 h-4 w-4 shrink-0"
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
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-secondary-950 relative mt-20 overflow-hidden rounded-2xl p-10 text-center md:p-16">
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
                Ready to schedule training?
              </h2>
              <p className="text-secondary-300 mx-auto mb-8 max-w-lg">
                Tell us your group size, location, and preferred dates — we&apos;ll
                send a quote within one business day.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="group bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-3 rounded-full px-7 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  Request a Quote
                </Link>
                <Link
                  href="/training-videos"
                  className="border-primary-500/40 text-primary-400 hover:border-primary-500 hover:text-primary-300 inline-flex items-center rounded-full border px-7 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  Watch Training Videos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
