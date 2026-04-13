import type { Metadata } from "next";
import Image from "next/image";
import { getStoreConfig } from "~/lib/store-config.server";
import ContactForm from "./ContactForm";
import FaqAccordion from "../faq/FaqAccordion";

const contactFaqs = [
  {
    q: "What Brass Preparation do you recommend for your Brass?",
    a: "We recommend full-length sizing, trimming to length, and deburring/chamfering before loading. Our OCD Technology brass is already weight-sorted and dimensionally inspected, so minimal additional prep is needed compared to standard brass.",
  },
  {
    q: "What is the weight variation of your brass?",
    a: "Our brass is individually weight-sorted to extremely tight tolerances as part of our OCD Technology process. Weight variation is typically held to less than 0.5 grains, which is far tighter than industry standard.",
  },
  {
    q: "Do you manufacture all products in-house?",
    a: "Yes, all Alpha Munitions products are manufactured in our facility in American Fork, Utah. We control every step of the process to ensure the highest quality standards.",
  },
  {
    q: "How do I get notified of new products?",
    a: "Sign up for our newsletter to receive notifications about new product launches, restocks, and exclusive offers. You can also follow us on social media for the latest updates.",
  },
  {
    q: "Do you have any international distributors?",
    a: "We are currently focused on domestic distribution within the United States. For international inquiries, please contact us directly and we will do our best to assist you.",
  },
  {
    q: "I'm interested in becoming a distributor",
    a: "We welcome inquiries from qualified retailers and distributors. Please visit our Distributors page or contact us directly with your business information, and our team will review your application.",
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
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/heroes/contact.jpg"
          alt="Precision shooting"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
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
            <p className="max-w-lg text-sm leading-relaxed text-white/60">
              Questions about our products, need order support, or interested in
              wholesale pricing? We are here to help.
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
