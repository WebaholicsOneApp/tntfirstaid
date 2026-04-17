"use client";

import Image from "next/image";
import Link from "next/link";
import ProductCard from "~/components/products/ProductCard";
import type { ProductListItem } from "~/types";

interface Props {
  products: ProductListItem[];
}

const industries = [
  {
    label: "Offices",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15M9 7.5V6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0115 6v1.5m6 3.75v-.75A2.25 2.25 0 0018.75 8.25H5.25A2.25 2.25 0 003 10.5v.75m18 0a2.25 2.25 0 01-1.183 1.981l-6.478 3.488a2.25 2.25 0 01-2.678 0l-6.478-3.488A2.25 2.25 0 013 11.25"
        />
      </svg>
    ),
  },
  {
    label: "Schools",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
        />
      </svg>
    ),
  },
  {
    label: "Factories",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m4.5-6H16.5m-1.5 3H16.5m-1.5 3H16.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
        />
      </svg>
    ),
  },
  {
    label: "Responders",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
        />
      </svg>
    ),
  },
];

export default function FeaturedProductsGrid({ products }: Props) {
  if (!products || products.length === 0) return null;

  const featured = products.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                Featured
              </span>
            </div>
            <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              First Aid Essentials
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-secondary-600 hover:text-primary-600 group hidden items-center gap-2 text-sm font-semibold uppercase transition-colors md:inline-flex"
          >
            Browse All Kits
            <svg
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </Link>
        </div>

        {/* Grid: 2x2 products + industries panel */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Products: 1 col on phones, 2 cols from sm up */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Industries panel */}
          <div className="ring-secondary-100 bg-secondary-950 relative h-full min-h-[420px] overflow-hidden rounded-2xl shadow-lg ring-1">
              {/* Gradient backdrop */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 20%, rgba(227,24,55,0.28) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(227,24,55,0.18) 0%, transparent 55%)",
                }}
              />
              <div className="relative flex h-full flex-col p-7 sm:p-8">
                <h3 className="font-display text-2xl leading-tight font-bold text-white sm:text-3xl">
                  Industries We Are Proud To Serve
                </h3>
                <p className="text-secondary-300 mt-3 text-sm leading-relaxed">
                  From offices and classrooms to factories and first
                  responders, we build kits that match the real work our
                  customers do.
                </p>

                {/* Industry icons */}
                <div className="mt-8 grid grid-cols-4 gap-3">
                  {industries.map(({ label, icon }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="bg-primary-500/15 ring-primary-500/30 text-primary-400 flex h-14 w-14 items-center justify-center rounded-full ring-1">
                        <span className="block h-6 w-6">{icon}</span>
                      </div>
                      <span className="text-secondary-200 text-center text-xs font-medium">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Image fills the empty space between icons and CTA */}
                <div className="relative mt-6 min-h-[140px] flex-1 overflow-hidden rounded-xl">
                  <Image
                    src="/images/hero/hero-bandage.jpg"
                    alt="Applying a bandage"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.6) 100%)",
                    }}
                  />
                </div>

                {/* CTA */}
                <Link
                  href="/contact"
                  className="group bg-primary-500 hover:bg-primary-400 mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-colors active:scale-[0.98]"
                >
                  Learn About Custom Kitting
                  <svg
                    className="h-2.5 w-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </Link>
              </div>
            </div>
        </div>

        {/* Mobile "Browse All Kits" link */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="group border-primary-500 text-primary-600 hover:bg-primary-500 inline-flex items-center gap-3 rounded-full border px-8 py-3 text-sm font-semibold uppercase transition-colors hover:text-white active:scale-[0.98]"
          >
            Browse All Kits
            <svg
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
