"use client";

import { ProductImage } from "~/components/ui/ProductImage";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import type { ProductListItem } from "~/types";
import ProductCard from "~/components/products/ProductCard";
import QuickAddModal from "~/components/products/QuickAddModal";
import AnimateIn from "~/components/ui/AnimateIn";

interface ShopBrassGridProps {
  products: ProductListItem[];
}

const WP_UPLOADS = "https://alphamunitions.com/wp-content/uploads/";

const placeholderBrass = [
  {
    name: "6.5 Grendel SRP",
    price: "$140 – $1,400",
    image: `${WP_UPLOADS}2025/03/Rico-Alpha-65-Grendel-9840-VERT-scaled-e1742500032501-300x450.jpg`,
    slug: "6-5-grendel-srp",
  },
  {
    name: "22 ARC SRP",
    price: "$140 – $1,400",
    image: `${WP_UPLOADS}2024/09/Rico-22-ARC-0835-scaled-300x442.jpg`,
    slug: "22-arc-srp",
  },
  {
    name: "6mm PPC",
    price: "$160 – $1,600",
    image: `${WP_UPLOADS}2024/09/Rico-6-PPC-0864-scaled-e1726071617775-300x446.jpg`,
    slug: "6mm-ppc",
  },
  {
    name: "7mm-08 SRP",
    price: "$126 – $1,300",
    image: `${WP_UPLOADS}2024/09/7mm-08-SRP-scaled-e1725406037514-300x446.jpg`,
    slug: "7mm-08-srp",
  },
  {
    name: "6mm ARC",
    price: "$135 – $1,350",
    image: `${WP_UPLOADS}2024/06/Rico-6ARC-Vert-6370-scaled-e1719323726456-300x450.jpg`,
    slug: "6mm-arc",
  },
  {
    name: "25x47 (SRP)",
    price: "$145 – $1,450",
    image: `${WP_UPLOADS}2024/08/Rico-Alpha-25x47-1-e1724358115917-300x448.png`,
    slug: "25x47-srp",
  },
  {
    name: "25 GT (SRP)",
    price: "$135 – $1,300",
    image: `${WP_UPLOADS}2024/02/Rico-Alpha-25GT-A-9750-scaled-e1708089582151-300x451.jpg`,
    slug: "25-gt-srp",
  },
  {
    name: "8.6 BLK",
    price: "$130 – $1,300",
    image: `${WP_UPLOADS}2024/01/Rico-8_6-BLK-Vert_0404-e1708089741351-300x414.jpg`,
    slug: "8-6-blk",
  },
  {
    name: ".260 Remington SRP",
    price: "$126 – $1,180",
    image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-SRP-8639-2-300x445.jpg`,
    slug: "260-remington-srp",
  },
  {
    name: ".260 Remington LRP",
    price: "$126 – $1,180",
    image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-LRP-8601-300x443.jpg`,
    slug: "260-remington-lrp",
  },
  {
    name: ".308 Winchester LRP",
    price: "$123 – $1,180",
    image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-Win-LRP-8636-300x445.jpg`,
    slug: "308-winchester-lrp",
  },
  {
    name: ".308 Winchester SRP",
    price: "$123 – $1,180",
    image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-WIN-SRP-8667-300x444.jpg`,
    slug: "308-winchester-srp",
  },
];

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group border-secondary-200 hover:border-primary-500 hover:bg-primary-50 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95"
      aria-label={`Scroll ${direction}`}
    >
      <svg
        className="text-secondary-400 group-hover:text-primary-600 h-3.5 w-3.5 transition-colors duration-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}

export default function ShopBrassCarousel({ products }: ShopBrassGridProps) {
  const hasDbProducts = products.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [, setScrollState] = useState({ left: false, right: true });
  const [quickAddProduct, setQuickAddProduct] =
    useState<ProductListItem | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector(":scope > *")?.clientWidth ?? 220;
      el.scrollBy({
        left:
          direction === "left" ? -(cardWidth + 16) * 3 : (cardWidth + 16) * 3,
        behavior: "smooth",
      });
      scrollTimeoutRef.current = setTimeout(updateScrollState, 350);
    },
    [updateScrollState],
  );

  useEffect(() => () => clearTimeout(scrollTimeoutRef.current), []);

  const items = hasDbProducts ? products.slice(0, 12) : placeholderBrass;

  return (
    <>
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* ── Header ──────────────────────────────────────── */}
          <AnimateIn animation="fade-up">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6 shrink-0" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Featured Brass
                  </span>
                </div>
                <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                  Shop Brass
                </h2>
                <p className="text-secondary-300 mt-2 font-mono text-[0.65rem] tracking-[0.15em] uppercase">
                  Precision-Manufactured Rifle Brass
                </p>
              </div>
              <div className="mb-1 flex items-center gap-2">
                <CarouselArrow
                  direction="left"
                  onClick={() => scroll("left")}
                />
                <CarouselArrow
                  direction="right"
                  onClick={() => scroll("right")}
                />
              </div>
            </div>
          </AnimateIn>

          {/* ── Carousel ────────────────────────────────────── */}
          <AnimateIn animation="fade-up" delay={100}>
            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="-mt-2 -mb-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pt-2 pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {hasDbProducts
                ? (items as ProductListItem[]).map((product) => (
                    <div
                      key={product.id}
                      className="w-[200px] flex-shrink-0 snap-start sm:w-[220px]"
                    >
                      <ProductCard
                        product={product}
                        onQuickAdd={() => setQuickAddProduct(product)}
                      />
                    </div>
                  ))
                : (items as typeof placeholderBrass).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/product/${item.slug}`}
                      className="group border-secondary-100 hover:border-primary-300 block w-[200px] flex-shrink-0 snap-start rounded-lg border bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,195,96,0.10)] active:translate-y-0 active:scale-[0.99] sm:w-[220px]"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-white">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                          sizes="220px"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-secondary-800 group-hover:text-primary-600 line-clamp-2 text-sm leading-snug font-medium transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-secondary-900 mt-2 text-base font-semibold">
                          {item.price}
                        </p>
                        <p className="text-primary-600 mt-1.5 text-xs font-medium tracking-wider uppercase">
                          Select Options
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
          </AnimateIn>

          {/* ── CTA ─────────────────────────────────────────── */}
          <AnimateIn animation="fade-up" delay={200}>
            <div className="mt-10">
              <Link
                href="/shop"
                className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                Shop All Brass
                <span className="bg-secondary-950/10 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110">
                  <svg
                    className="h-2.5 w-2.5"
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
                </span>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </>
  );
}
