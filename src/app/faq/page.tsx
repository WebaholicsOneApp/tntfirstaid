import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";
import FaqAccordion from "./FaqAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "FAQ & Help",
    description: `Frequently asked questions about ${config.siteName} products, training classes, shipping, and returns.`,
  };
}

const faqSections = [
  {
    id: "products",
    category: "Products & Kits",
    questions: [
      {
        q: "Are your first aid kits OSHA compliant?",
        a: "Yes. Our workplace kits meet or exceed ANSI/ISEA Z308.1 Class A and Class B standards, which are the benchmarks OSHA references for workplace first aid supplies. Every kit lists the standard it complies with and the recommended team size.",
      },
      {
        q: "How often should I restock or replace items in my kit?",
        a: "Check your kit every 3-6 months. Replace any items that are expired, used, or damaged. We offer restock subscriptions and can send reminders. Certain items (like epinephrine auto-injectors and AED pads/batteries) have shorter shelf lives and should be tracked individually.",
      },
      {
        q: "Do you sell AEDs and batteries/pads?",
        a: "Yes. We carry AEDs from leading manufacturers along with replacement pads, batteries, and wall cabinets. If you already own an AED, we can help you find the right replacement consumables by model.",
      },
    ],
  },
  {
    id: "training",
    category: "Training & Certification",
    questions: [
      {
        q: "What classes do you offer?",
        a: "CPR/AED (adult, child, and infant), First Aid, Bloodborne Pathogens, and Stop the Bleed. Courses are available as stand-alone classes or combined into a single certification. All classes are taught by certified instructors.",
      },
      {
        q: "Can you come train my team on-site?",
        a: "Yes — that's what we do best. We travel to workplaces, schools, and community organizations across the region. Contact us with your location, group size, and preferred dates and we'll put together a quote.",
      },
      {
        q: "How long are certifications valid?",
        a: "CPR, AED, and First Aid certifications are typically valid for 2 years. Bloodborne Pathogens certification is annual (required by OSHA for covered workers). We'll send a renewal reminder before your card expires.",
      },
    ],
  },
  {
    id: "orders",
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Orders are typically processed within 1-2 business days. Standard ground delivery takes 3-7 business days after shipment. Expedited shipping is available at checkout for time-sensitive orders.",
      },
      {
        q: "Do you ship to all states?",
        a: "Yes — we ship throughout the continental United States. Contact us for Alaska, Hawaii, or international shipping inquiries.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, you'll receive an email with a tracking number. If you haven't received tracking info within 3 business days of ordering, please contact us.",
      },
    ],
  },
  {
    id: "returns",
    category: "Returns & Support",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy for items in their original, unopened condition with all original packaging. Opened or used medical supplies cannot be returned for safety reasons. Contact our team to request a Return Authorization before shipping anything back.",
      },
      {
        q: "Do you offer bulk or corporate pricing?",
        a: "Yes. We work with businesses, schools, and healthcare organizations on bulk kit orders, recurring restocking programs, and AED rollouts. Contact us directly for a quote.",
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
        a: "Yes. All payments are processed through Stripe, a PCI Level 1 certified payment processor — the highest level of security in the payments industry. Your card details are encrypted with 256-bit SSL and never stored on our servers.",
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
