import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';
import ContactForm from './ContactForm';
import FaqAccordion from '../faq/FaqAccordion';

const contactFaqs = [
  {
    q: 'What Brass Preparation do you recommend for your Brass?',
    a: 'We recommend full-length sizing, trimming to length, and deburring/chamfering before loading. Our OCD Technology brass is already weight-sorted and dimensionally inspected, so minimal additional prep is needed compared to standard brass.',
  },
  {
    q: 'What is the weight variation of your brass?',
    a: 'Our brass is individually weight-sorted to extremely tight tolerances as part of our OCD Technology process. Weight variation is typically held to less than 0.5 grains, which is far tighter than industry standard.',
  },
  {
    q: 'Do you manufacture all products in-house?',
    a: 'Yes, all Alpha Munitions products are manufactured in our facility in American Fork, Utah. We control every step of the process to ensure the highest quality standards.',
  },
  {
    q: 'How do I get notified of new products?',
    a: 'Sign up for our newsletter to receive notifications about new product launches, restocks, and exclusive offers. You can also follow us on social media for the latest updates.',
  },
  {
    q: 'Do you have any international distributors?',
    a: 'We are currently focused on domestic distribution within the United States. For international inquiries, please contact us directly and we will do our best to assist you.',
  },
  {
    q: "I'm interested in becoming a distributor",
    a: 'We welcome inquiries from qualified retailers and distributors. Please visit our Distributors page or contact us directly with your business information, and our team will review your application.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Contact Us',
    description: `Get in touch with the ${config.siteName} team for product questions, order support, or wholesale inquiries.`,
  };
}

export default async function ContactPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/heroes/contact.jpg"
          alt="Precision shooting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Reach Out
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            Questions about our products, need order support, or interested in
            wholesale pricing? We are here to help.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Information */}
            <div className="space-y-10 order-first md:order-last">
              <div>
                <h2 className="text-2xl font-display font-bold text-secondary-800 mb-8">
                  Get In Touch
                </h2>

                <div className="space-y-8">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-800 uppercase text-xs tracking-widest mb-1">
                        Address
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {storeConfig.address.split('\n').map((line, i, arr) => (
                          <span key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-800 uppercase text-xs tracking-widest mb-1">
                        Phone
                      </h3>
                      <p className="text-gray-600">
                        <a
                          href={storeConfig.phoneHref}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {storeConfig.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-800 uppercase text-xs tracking-widest mb-1">
                        Email
                      </h3>
                      <p className="text-gray-600">
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
                    <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-800 uppercase text-xs tracking-widest mb-1">
                        Business Hours
                      </h3>
                      <p className="text-gray-600">{storeConfig.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                <h4 className="text-lg font-display font-bold text-secondary-800 mb-3 ml-4">
                  Visit Our Facility
                </h4>
                <p className="text-sm text-gray-500 mb-4 ml-4">
                  Tours available by appointment for dealers and wholesale
                  customers.
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${storeConfig.mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video rounded-xl overflow-hidden relative group ml-4"
                >
                  <iframe
                    src={`https://maps.google.com/maps?q=${storeConfig.mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-secondary-800 px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                      Open in Google Maps
                    </span>
                  </div>
                </a>
              </div>

              {/* Quick links */}
              <div className="flex gap-4">
                <Link
                  href="/faq"
                  className="flex-1 bg-secondary-50 rounded-xl p-5 border border-secondary-100 text-center hover:shadow-md transition-shadow"
                >
                  <p className="font-bold text-secondary-800 text-sm mb-1">
                    FAQ
                  </p>
                  <p className="text-xs text-gray-500">
                    Common questions answered
                  </p>
                </Link>
                <Link
                  href="/shipping-returns"
                  className="flex-1 bg-secondary-50 rounded-xl p-5 border border-secondary-100 text-center hover:shadow-md transition-shadow"
                >
                  <p className="font-bold text-secondary-800 text-sm mb-1">
                    Shipping & Returns
                  </p>
                  <p className="text-xs text-gray-500">
                    Policies and timelines
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* Inline FAQ */}
          <section className="mt-16 pt-16 border-t border-secondary-100">
            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto">
              <FaqAccordion questions={contactFaqs} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
