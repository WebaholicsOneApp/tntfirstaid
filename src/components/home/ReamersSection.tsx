'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { ProductListItem } from '~/types';
import ProductCard from '~/components/products/ProductCard';
import AnimateIn from '~/components/ui/AnimateIn';

interface ReamersSectionProps {
  products: ProductListItem[];
}

const WP_UPLOADS = 'https://alphamunitions.com/wp-content/uploads/';

const placeholderReamers = [
  {
    name: 'Alpha Legacy Chamber Gauge + .004"',
    price: '$140 – $175',
    image: `${WP_UPLOADS}2025/10/CaseGauge_CM002-300x300.jpg`,
    slug: 'alpha-legacy-chamber-gauge',
  },
  {
    name: 'Alpha Legacy Chamber Go Gauge',
    price: '$140 – $175',
    image: `${WP_UPLOADS}2025/10/CaseGauge_CM002-300x300.jpg`,
    slug: 'alpha-legacy-chamber-go-gauge',
  },
];

function CarouselArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-10 h-10 rounded-full border border-secondary-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      aria-label={`Scroll ${direction}`}
    >
      <svg className="w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-600 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
}

export default function ReamersSection({ products }: ReamersSectionProps) {
  const hasDbProducts = products.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [, setScrollState] = useState({ left: false, right: true });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > *')?.clientWidth ?? 260;
    el.scrollBy({ left: direction === 'left' ? -(cardWidth + 16) * 2 : (cardWidth + 16) * 2, behavior: 'smooth' });
    scrollTimeoutRef.current = setTimeout(updateScrollState, 350);
  }, [updateScrollState]);

  useEffect(() => () => clearTimeout(scrollTimeoutRef.current), []);

  const items = hasDbProducts ? products.slice(0, 8) : placeholderReamers;

  return (
    <section className="relative overflow-hidden bg-white pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────── */}
        <AnimateIn animation="fade-up">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-primary-500 shrink-0" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                  Tools &amp; Accessories
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-secondary-900 leading-tight">
                Reamers &amp; Gear
              </h2>
              <p className="mt-2 font-mono text-[0.65rem] tracking-[0.15em] text-secondary-300 uppercase">
                Engineered for the Precision Shooter
              </p>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <CarouselArrow direction="left" onClick={() => scroll('left')} />
              <CarouselArrow direction="right" onClick={() => scroll('right')} />
            </div>
          </div>
        </AnimateIn>

        {/* ── Carousel ────────────────────────────────────── */}
        <AnimateIn animation="fade-up" delay={100}>
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto pb-2 -mb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hasDbProducts ? (
              (items as ProductListItem[]).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              (items as typeof placeholderReamers).map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start group block bg-white rounded-2xl border border-secondary-100 hover:border-primary-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      sizes="260px"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-mono text-[0.6rem] tracking-[0.15em] text-secondary-600 uppercase group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 leading-relaxed">
                      {item.name}
                    </h3>
                    <p className="mt-2 font-display text-base font-bold text-secondary-900">
                      {item.price}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[0.6rem] font-mono tracking-[0.12em] text-primary-600 uppercase">
                        Select Options
                      </span>
                      <svg className="w-2.5 h-2.5 text-primary-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </AnimateIn>

        {/* ── CTA ─────────────────────────────────────────── */}
        <AnimateIn animation="fade-up" delay={200}>
          <div className="mt-10">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Shop All Gear
              <span className="w-5 h-5 rounded-full bg-secondary-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </span>
            </Link>
          </div>
        </AnimateIn>

      </div>
    </section>
  );
}
