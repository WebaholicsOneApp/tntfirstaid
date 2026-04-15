"use client";

import Link from "next/link";
import { useRef } from "react";
import ProductCard from "~/components/products/ProductCard";
import type { ProductListItem } from "~/types";

interface Props {
  products: ProductListItem[];
}

export default function FeaturedProductsCarousel({ products }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-secondary-400 font-mono text-xs tracking-[0.3em] uppercase md:text-sm">
                Featured
              </span>
            </div>
            <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              First Aid Essentials
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="border-secondary-200 hover:border-primary-500 hover:text-primary-500 text-secondary-500 flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="border-secondary-200 hover:border-primary-500 hover:text-primary-500 text-secondary-500 flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[220px] shrink-0 snap-start sm:w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="group border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white inline-flex items-center gap-3 rounded-full border px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            Shop All Products
            <svg
              className="h-2.5 w-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px"
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
