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
      className="w-10 h-10 rounded-full border border-secondary-300 flex items-center justify-center hover:border-secondary-500 hover:bg-secondary-50 transition-colors"
      aria-label={`Scroll ${direction}`}
    >
      <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <section className="bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-screen">
        {/* Left: Large reamer image */}
        <AnimateIn animation="slide-left-far" duration={1200} className="hidden lg:block relative bg-white shadow-xl overflow-hidden h-full">
          <Image
            src="/images/reamer-hero.jpg"
            alt="Alpha Munitions Reamer Tool"
            fill
            className="object-contain p-12"
            sizes="50vw"
          />
        </AnimateIn>

        {/* Right: Heading + carousel */}
        <div className="w-full px-6 lg:pl-12 lg:pr-8 overflow-hidden py-14 sm:py-20 flex flex-col justify-center bg-white">
          <AnimateIn animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-800 tracking-[0.15em] uppercase">
                Reamers
              </h2>
              <div className="flex items-center gap-3">
                <CarouselArrow
                  direction="left"
                  onClick={() => scroll('left')}
                />
                <CarouselArrow
                  direction="right"
                  onClick={() => scroll('right')}
                />
              </div>
            </div>
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
                  <div key={product.id} className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                (items as typeof placeholderReamers).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/product/${item.slug}`}
                    className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start group block bg-white border border-secondary-100 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="200px"
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

          <AnimateIn animation="fade-up" delay={200}>
            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-block bg-primary-500 hover:bg-primary-600 rounded-md text-white font-semibold text-sm tracking-[0.15em] uppercase px-8 py-3 transition-colors duration-200"
              >
                SHOP ALL GEAR
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
