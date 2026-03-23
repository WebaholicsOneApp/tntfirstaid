import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';
import FaqAccordion from './FaqAccordion';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'FAQ & Help',
    description: `Frequently asked questions about ${config.siteName} products, shipping, OCD Technology, and more.`,
  };
}

const faqSections = [
  {
    id: 'products',
    category: 'Products & Technology',
    questions: [
      {
        q: 'What is OCD Technology?',
        a: 'OCD (Obsessive Cartridge Disorder) Technology is our proprietary brass processing method. Every piece of brass is individually weight-sorted, dimensionally inspected, and processed to tolerances far beyond industry standard. The result is brass with exceptional consistency in neck tension, case capacity, and concentricity.',
      },
      {
        q: 'Are your products made in the USA?',
        a: 'Yes. All Alpha Munitions products are manufactured in our facility in American Fork, Utah. We source domestically whenever possible and are proud to support American manufacturing.',
      },
      {
        q: 'What calibers do you offer?',
        a: 'We offer a growing selection of precision brass, reamers, and components across popular long-range and competition calibers. Check our Shop page for our current product catalog, which is updated regularly as we release new offerings.',
      },
    ],
  },
  {
    id: 'orders',
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'Do you ship to all states?',
        a: 'We ship to the continental United States. However, some states have restrictions on ammunition and component purchases. It is the buyer\'s responsibility to verify that their purchase complies with all applicable federal, state, and local laws. We reserve the right to cancel orders that cannot be legally fulfilled.',
      },
      {
        q: 'How long does shipping take?',
        a: 'Orders are typically processed within 1-3 business days. Standard ground delivery takes 3-7 business days after shipment. All ammunition and components ship via UPS Ground only due to HAZMAT regulations -- air shipping is not available.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order ships, you will receive an email with a UPS tracking number. You can use this number to track your package on the UPS website. If you have not received tracking information within 5 business days of placing your order, please contact us.',
      },
    ],
  },
  {
    id: 'returns',
    category: 'Returns & Support',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for items in their original, unopened condition with all original packaging. Ammunition that has been opened or used cannot be returned. Custom-order items are non-returnable. Contact our support team to request a Return Authorization before shipping anything back.',
      },
      {
        q: 'Do you offer wholesale pricing?',
        a: 'Yes, we offer wholesale and dealer pricing for qualified retailers and distributors. Visit our Distributors page or contact us directly to learn about our wholesale program, minimums, and dealer application process.',
      },
    ],
  },
  {
    id: 'checkout',
    category: 'Payments & Security',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), Apple Pay, and Google Pay. All payments are processed securely through Stripe.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. All payments are processed through Stripe, a PCI Level 1 certified payment processor -- the highest level of security in the payments industry. Your card details are encrypted with 256-bit SSL and never stored on our servers.',
      },
    ],
  },
];

export default async function FaqPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4 font-mono text-xs tracking-wider text-secondary-400">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-secondary-300">/</span>
        <span className="text-secondary-500 font-medium">FAQ & Help</span>
      </nav>

      {/* Hero Header */}
      <header className="bg-secondary-900 py-12 md:py-16 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-primary-500/15 z-10" />
        <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-primary-500/15 z-10" />
        <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-primary-500/15 z-10" />
        <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-primary-500/15 z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Frequently Asked{' '}
            <span className="text-primary-500">Questions</span>
          </h1>
          <p className="text-secondary-400 max-w-2xl mx-auto text-lg">
            Find answers to common questions about our products, shipping,
            returns, and more.
          </p>
          <div className="mx-auto mt-4 h-[1px] w-[80px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {faqSections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-48">
                <h2 className="text-xl font-display font-bold text-secondary-800 mb-8 border-l-4 border-primary-500 pl-4 font-mono">
                  {section.category}
                </h2>
                <FaqAccordion questions={section.questions} />
              </section>
            ))}
          </div>

          {/* Quick Links CTA */}
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            <Link
              href="/contact"
              className="bg-white p-8 border border-secondary-100 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-primary-500/10 rounded flex items-center justify-center text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-secondary-800 mb-2 text-xs uppercase tracking-widest">
                Contact Us
              </h3>
              <p className="text-secondary-500 text-xs">
                Speak with our team directly.
              </p>
            </Link>

            <Link
              href="/shipping-returns"
              className="bg-white p-8 border border-secondary-100 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-secondary-100 rounded flex items-center justify-center text-secondary-700 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-secondary-800 mb-2 text-xs uppercase tracking-widest">
                Returns
              </h3>
              <p className="text-secondary-500 text-xs">
                Start a return or exchange.
              </p>
            </Link>

            <Link
              href="/shop"
              className="bg-white p-8 border border-secondary-100 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-12 h-12 bg-secondary-800 rounded flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-bold text-secondary-800 mb-2 text-xs uppercase tracking-widest">
                Shop
              </h3>
              <p className="text-secondary-500 text-xs">
                Browse our product catalog.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
