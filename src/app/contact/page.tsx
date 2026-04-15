import type { Metadata } from "next";
import { getStoreConfig } from "~/lib/store-config.server";
import ContactForm from "./ContactForm";
import FaqAccordion from "../faq/FaqAccordion";

const contactFaqs = [
  {
    q: "How do I schedule CPR or First Aid training for my team?",
    a: "Fill out the form below with your group size, preferred date, and location. We'll send a quote within one business day and confirm a certified instructor. On-site training is available throughout the region.",
  },
  {
    q: "Can you build a custom first aid kit for my workplace?",
    a: "Yes. Tell us your team size, industry, and any specific hazards (chemicals, machinery, remote worksites) and we'll put together a kit that meets OSHA/ANSI requirements for your environment.",
  },
  {
    q: "Do you offer AED maintenance and pad/battery replacement?",
    a: "Yes. We can help you track expiration dates, ship replacement consumables, and advise on placement and required signage. If you don't know which AED model you have, send us a photo and we'll identify it.",
  },
  {
    q: "How do I get notified of training dates and new products?",
    a: "Sign up for our newsletter to receive updates on upcoming public training classes, new product launches, and restocking reminders.",
  },
  {
    q: "Do you work with schools and non-profits?",
    a: "Absolutely. We offer group pricing for schools, churches, community organizations, and non-profits. Get in touch and let us know what you need.",
  },
  {
    q: "I'd like to order in bulk for my business.",
    a: "We work with businesses, property managers, and healthcare organizations on bulk and recurring orders. Contact us directly with your order details and we'll set up a quote and an account manager.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Contact Us",
    description: `Get in touch with the ${config.siteName} team for product questions, order support, or wholesale inquiries.`,
  };
}

export default async function ContactPage() {
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
                Reach Out
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              Contact Us
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Questions about kits, AEDs, or scheduling on-site training?
              Send us a note — we&apos;ll get back to you within one business
              day.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Row 1: FAQ (left) + Contact Form (right) */}
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            <section>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Frequently Asked
                </span>
              </div>
              <h2 className="font-display text-secondary-900 mb-6 text-2xl font-bold">
                Frequently Asked Questions
              </h2>
              <FaqAccordion questions={contactFaqs} />
            </section>

            <ContactForm />
          </div>

          {/* Row 2: Get In Touch — Map left, contact info right */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Get In Touch
              </span>
            </div>
            <h2 className="font-display text-secondary-900 mb-6 text-2xl font-bold">
              Get In Touch
            </h2>

            <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
              {/* Map */}
              <div className="bg-secondary-50 border-secondary-100 overflow-hidden rounded-2xl border">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${storeConfig.mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[4/3] md:aspect-auto md:h-full"
                >
                  <iframe
                    src={`https://maps.google.com/maps?q=${storeConfig.mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <span className="text-secondary-800 rounded-lg bg-white/90 px-4 py-2 text-sm font-bold opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      Open in Google Maps
                    </span>
                  </div>
                </a>
              </div>

              {/* Contact info stacked vertically */}
              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-secondary-800 mb-1 text-xs font-bold tracking-widest uppercase">
                      Address
                    </h3>
                    <p className="text-secondary-600 text-sm leading-relaxed">
                      {storeConfig.address.split("\n").map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-secondary-800 mb-1 text-xs font-bold tracking-widest uppercase">
                      Email
                    </h3>
                    <p className="text-secondary-600 text-sm">
                      <a
                        href={`mailto:${storeConfig.email}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {storeConfig.email}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="bg-secondary-100 text-secondary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-secondary-800 mb-1 text-xs font-bold tracking-widest uppercase">
                      Business Hours
                    </h3>
                    <p className="text-secondary-600 text-sm">
                      {storeConfig.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
