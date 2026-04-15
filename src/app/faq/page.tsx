import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";
import FaqAccordion from "./FaqAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "FAQ & Help",
    description: `Frequently asked questions about ${config.siteName} products, shipping, OCD Technology, and more.`,
  };
}

const faqSections = [
  {
    id: "products",
    category: "Products & Technology",
    questions: [
      {
        q: "What is OCD Technology?",
        a: "OCD (Obsessive Cartridge Disorder) Technology is our proprietary brass processing method. Every piece of brass is individually weight-sorted, dimensionally inspected, and processed to tolerances far beyond industry standard. The result is brass with exceptional consistency in neck tension, case capacity, and concentricity.",
      },
      {
        q: "Are your products made in the USA?",
        a: "Yes. All TNT First Aid products are manufactured in our facility in American Fork, Utah. We source domestically whenever possible and are proud to support American manufacturing.",
      },
      {
        q: "What calibers do you offer?",
        a: "We offer a growing selection of precision brass, reamers, and components across popular long-range and competition calibers. Check our Shop page for our current product catalog, which is updated regularly as we release new offerings.",
      },
    ],
  },
  {
    id: "orders",
    category: "Orders & Shipping",
    questions: [
      {
        q: "Do you ship to all states?",
        a: "We ship to the continental United States. However, some states have restrictions on ammunition and component purchases. It is the buyer's responsibility to verify that their purchase complies with all applicable federal, state, and local laws. We reserve the right to cancel orders that cannot be legally fulfilled.",
      },
      {
        q: "How long does shipping take?",
        a: "Orders are typically processed within 1-3 business days. Standard ground delivery takes 3-7 business days after shipment. All ammunition and components ship via UPS Ground only due to HAZMAT regulations -- air shipping is not available.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, you will receive an email with a UPS tracking number. You can use this number to track your package on the UPS website. If you have not received tracking information within 5 business days of placing your order, please contact us.",
      },
    ],
  },
  {
    id: "returns",
    category: "Returns & Support",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy for items in their original, unopened condition with all original packaging. Ammunition that has been opened or used cannot be returned. Custom-order items are non-returnable. Contact our support team to request a Return Authorization before shipping anything back.",
      },
      {
        q: "Do you offer wholesale pricing?",
        a: "Yes, we offer wholesale and dealer pricing for qualified retailers and distributors. Visit our Distributors page or contact us directly to learn about our wholesale program, minimums, and dealer application process.",
      },
    ],
  },
  {
    id: "checkout",
    category: "Payments & Security",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), Apple Pay, and Google Pay. All payments are processed securely through Stripe.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are processed through Stripe, a PCI Level 1 certified payment processor -- the highest level of security in the payments industry. Your card details are encrypted with 256-bit SSL and never stored on our servers.",
      },
    ],
  },
];

export default async function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="text-secondary-400 container mx-auto px-4 py-4 font-mono text-xs tracking-wider">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="text-secondary-300 mx-2">/</span>
        <span className="text-secondary-500 font-medium">FAQ & Help</span>
      </nav>

      <header className="border-secondary-100 border-b bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Help &amp; Support
            </span>
          </div>
          <h1 className="font-display text-secondary-900 mb-4 text-4xl font-bold md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-secondary-400 max-w-2xl text-sm leading-relaxed">
            Find answers to common questions about our products, shipping,
            returns, and more.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-16">
            {faqSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-48"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    {section.id}
                  </span>
                </div>
                <h2 className="font-display text-secondary-900 mb-6 text-xl font-bold">
                  {section.category}
                </h2>
                <FaqAccordion questions={section.questions} />
              </section>
            ))}
          </div>

          {/* Quick Links CTA */}
          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <Link
              href="/contact"
              className="border-secondary-100 group border bg-white p-8 text-center shadow-lg transition-all hover:shadow-xl"
            >
              <div className="bg-primary-500/10 text-primary-600 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded transition-transform group-hover:scale-110">
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
              <h3 className="text-secondary-800 mb-2 text-xs font-bold tracking-widest uppercase">
                Contact Us
              </h3>
              <p className="text-secondary-500 text-xs">
                Speak with our team directly.
              </p>
            </Link>

            <Link
              href="/shipping-returns"
              className="border-secondary-100 group border bg-white p-8 text-center shadow-lg transition-all hover:shadow-xl"
            >
              <div className="bg-secondary-100 text-secondary-700 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded transition-transform group-hover:scale-110">
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
                    d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                  />
                </svg>
              </div>
              <h3 className="text-secondary-800 mb-2 text-xs font-bold tracking-widest uppercase">
                Returns
              </h3>
              <p className="text-secondary-500 text-xs">
                Start a return or exchange.
              </p>
            </Link>

            <Link
              href="/shop"
              className="border-secondary-100 group border bg-white p-8 text-center shadow-lg transition-all hover:shadow-xl"
            >
              <div className="bg-secondary-800 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded text-white transition-transform group-hover:scale-110">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-secondary-800 mb-2 text-xs font-bold tracking-widest uppercase">
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
