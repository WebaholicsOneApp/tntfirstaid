'use client';

import { ProductImage } from '~/components/ui/ProductImage';
import Link from 'next/link';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { ProductListItem } from '~/types';
import ProductCard from '~/components/products/ProductCard';
import AnimateIn from '~/components/ui/AnimateIn';

interface ShopBrassGridProps {
  products: ProductListItem[];
}

const WP_UPLOADS = 'https://alphamunitions.com/wp-content/uploads/';

const placeholderBrass = [
  { name: '6.5 Grendel SRP', price: '$140 – $1,400', image: `${WP_UPLOADS}2025/03/Rico-Alpha-65-Grendel-9840-VERT-scaled-e1742500032501-300x450.jpg`, slug: '6-5-grendel-srp' },
  { name: '22 ARC SRP', price: '$140 – $1,400', image: `${WP_UPLOADS}2024/09/Rico-22-ARC-0835-scaled-300x442.jpg`, slug: '22-arc-srp' },
  { name: '6mm PPC', price: '$160 – $1,600', image: `${WP_UPLOADS}2024/09/Rico-6-PPC-0864-scaled-e1726071617775-300x446.jpg`, slug: '6mm-ppc' },
  { name: '7mm-08 SRP', price: '$126 – $1,300', image: `${WP_UPLOADS}2024/09/7mm-08-SRP-scaled-e1725406037514-300x446.jpg`, slug: '7mm-08-srp' },
  { name: '6mm ARC', price: '$135 – $1,350', image: `${WP_UPLOADS}2024/06/Rico-6ARC-Vert-6370-scaled-e1719323726456-300x450.jpg`, slug: '6mm-arc' },
  { name: '25x47 (SRP)', price: '$145 – $1,450', image: `${WP_UPLOADS}2024/08/Rico-Alpha-25x47-1-e1724358115917-300x448.png`, slug: '25x47-srp' },
  { name: '25 GT (SRP)', price: '$135 – $1,300', image: `${WP_UPLOADS}2024/02/Rico-Alpha-25GT-A-9750-scaled-e1708089582151-300x451.jpg`, slug: '25-gt-srp' },
  { name: '8.6 BLK', price: '$130 – $1,300', image: `${WP_UPLOADS}2024/01/Rico-8_6-BLK-Vert_0404-e1708089741351-300x414.jpg`, slug: '8-6-blk' },
  { name: '.260 Remington SRP', price: '$126 – $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-SRP-8639-2-300x445.jpg`, slug: '260-remington-srp' },
  { name: '.260 Remington LRP', price: '$126 – $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-LRP-8601-300x443.jpg`, slug: '260-remington-lrp' },
  { name: '.308 Winchester LRP', price: '$123 – $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-Win-LRP-8636-300x445.jpg`, slug: '308-winchester-lrp' },
  { name: '.308 Winchester SRP', price: '$123 – $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-WIN-SRP-8667-300x444.jpg`, slug: '308-winchester-srp' },
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

export default function ShopBrassCarousel({ products }: ShopBrassGridProps) {
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
    const cardWidth = el.querySelector(':scope > *')?.clientWidth ?? 220;
    el.scrollBy({ left: direction === 'left' ? -(cardWidth + 16) * 3 : (cardWidth + 16) * 3, behavior: 'smooth' });
    scrollTimeoutRef.current = setTimeout(updateScrollState, 350);
  }, [updateScrollState]);

  useEffect(() => () => clearTimeout(scrollTimeoutRef.current), []);

  const items = hasDbProducts ? products.slice(0, 12) : placeholderBrass;

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────── */}
        <AnimateIn animation="fade-up">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-primary-500 shrink-0" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                  Featured Brass
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight">
                Shop Brass
              </h2>
              <p className="mt-2 font-mono text-[0.65rem] tracking-[0.15em] text-secondary-300 uppercase">
                Precision-Manufactured Rifle Brass
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
            className="flex gap-4 overflow-x-auto pt-2 -mt-2 pb-2 -mb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hasDbProducts ? (
              (items as ProductListItem[]).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              (items as typeof placeholderBrass).map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start group block bg-white rounded-lg border border-secondary-100 hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,195,96,0.10)] active:scale-[0.99] active:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-white">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      sizes="220px"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm font-medium text-secondary-800 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-base font-semibold text-secondary-900">
                      {item.price}
                    </p>
                    <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-primary-600">
                      Select Options
                    </p>
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
              Shop All Brass
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
