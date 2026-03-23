'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useCallback } from 'react';
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
    price: '$140 - $175',
    image: `${WP_UPLOADS}2025/10/CaseGauge_CM002-300x300.jpg`,
    slug: 'alpha-legacy-chamber-gauge',
  },
  {
    name: 'Alpha Legacy Chamber Go Gauge',
    price: '$140 - $175',
    image: `${WP_UPLOADS}2025/10/CaseGauge_CM002-300x300.jpg`,
    slug: 'alpha-legacy-chamber-go-gauge',
  },
];

function CarouselArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full border border-secondary-300 flex items-center justify-center hover:border-primary-500 transition-colors"
      aria-label={`Scroll ${direction}`}
    >
      <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
}

export default function ReamersSection({ products }: ReamersSectionProps) {
  const hasDbProducts = products.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > *')?.clientWidth ?? 220;
    const amount = (cardWidth + 16) * 2;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  }, [updateScrollState]);

  const items = hasDbProducts ? products.slice(0, 8) : placeholderReamers;

  return (
    <section className="relative overflow-hidden bg-secondary-50 py-20 sm:py-28">
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-secondary-200" />
      <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-secondary-200" />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-secondary-200" />
      <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-secondary-200" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Eyebrow */}
        <AnimateIn animation="fade-up">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-secondary-400 uppercase mb-4">
            {'// TOOLS & ACCESSORIES //'}
          </p>
        </AnimateIn>

        {/* Header with nav arrows */}
        <AnimateIn animation="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-800 tracking-wide">
              Reamers &amp; Gear
            </h2>
            <div className="flex items-center gap-3">
              <CarouselArrow direction="left" onClick={() => scroll('left')} />
              <CarouselArrow direction="right" onClick={() => scroll('right')} />
            </div>
          </div>
        </AnimateIn>

        {/* Gold divider */}
        <div className="h-[1px] w-[80px] bg-gradient-to-r from-primary-500 to-transparent mb-3" />

        {/* Subtitle */}
        <AnimateIn animation="fade-up" delay={50}>
          <p className="font-mono text-[0.7rem] tracking-[0.15em] text-secondary-400 uppercase mb-10">
            Engineered for the Precision Shooter
          </p>
        </AnimateIn>

        {/* Scrollable product row */}
        <AnimateIn animation="fade-up" delay={100}>
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mb-2 snap-x snap-mandatory"
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
                  className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start group block bg-white border border-secondary-100 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                      sizes="260px"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-medium text-secondary-800 uppercase tracking-wider group-hover:text-primary-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-secondary-900">
                      {item.price}
                    </p>
                    <p className="mt-1.5 text-xs text-primary-600 font-medium uppercase tracking-wider">
                      Select options
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </AnimateIn>

        {/* CTA Button */}
        <AnimateIn animation="fade-up" delay={200}>
          <div className="mt-10">
            <Link
              href="/shop"
              className="group relative inline-block overflow-hidden border border-primary-500 rounded font-mono font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 transition-colors duration-200"
            >
              <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
              <span className="relative z-10 text-primary-600 transition-colors duration-500 group-hover:text-secondary-900">
                SHOP ALL GEAR
              </span>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
