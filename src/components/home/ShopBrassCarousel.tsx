'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useCallback } from 'react';
import type { ProductListItem } from '~/types';
import ProductCard from '~/components/products/ProductCard';
import AnimateIn from '~/components/ui/AnimateIn';

interface ShopBrassGridProps {
  products: ProductListItem[];
}

const WP_UPLOADS = 'https://alphamunitions.com/wp-content/uploads/';

const placeholderBrass = [
  { name: '6.5 Grendel SRP', price: '$140 - $1,400', image: `${WP_UPLOADS}2025/03/Rico-Alpha-65-Grendel-9840-VERT-scaled-e1742500032501-300x450.jpg`, slug: '6-5-grendel-srp' },
  { name: '22 ARC SRP', price: '$140 - $1,400', image: `${WP_UPLOADS}2024/09/Rico-22-ARC-0835-scaled-300x442.jpg`, slug: '22-arc-srp' },
  { name: '6mm PPC', price: '$160 - $1,600', image: `${WP_UPLOADS}2024/09/Rico-6-PPC-0864-scaled-e1726071617775-300x446.jpg`, slug: '6mm-ppc' },
  { name: '7mm-08 SRP', price: '$126 - $1,300', image: `${WP_UPLOADS}2024/09/7mm-08-SRP-scaled-e1725406037514-300x446.jpg`, slug: '7mm-08-srp' },
  { name: '6mm ARC', price: '$135 - $1,350', image: `${WP_UPLOADS}2024/06/Rico-6ARC-Vert-6370-scaled-e1719323726456-300x450.jpg`, slug: '6mm-arc' },
  { name: '25x47 (SRP)', price: '$145 - $1,450', image: `${WP_UPLOADS}2024/08/Rico-Alpha-25x47-1-e1724358115917-300x448.png`, slug: '25x47-srp' },
  { name: '25 GT (SRP)', price: '$135 - $1,300', image: `${WP_UPLOADS}2024/02/Rico-Alpha-25GT-A-9750-scaled-e1708089582151-300x451.jpg`, slug: '25-gt-srp' },
  { name: '8.6 BLK', price: '$130 - $1,300', image: `${WP_UPLOADS}2024/01/Rico-8_6-BLK-Vert_0404-e1708089741351-300x414.jpg`, slug: '8-6-blk' },
  { name: '.260 Remington SRP', price: '$126 - $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-SRP-8639-2-300x445.jpg`, slug: '260-remington-srp' },
  { name: '.260 Remington LRP', price: '$126 - $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-260-REM-LRP-8601-300x443.jpg`, slug: '260-remington-lrp' },
  { name: '.308 Winchester LRP', price: '$123 - $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-Win-LRP-8636-300x445.jpg`, slug: '308-winchester-lrp' },
  { name: '.308 Winchester SRP', price: '$123 - $1,180', image: `${WP_UPLOADS}2019/04/Rico-Alpha-308-WIN-SRP-8667-300x444.jpg`, slug: '308-winchester-srp' },
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

export default function ShopBrassCarousel({ products }: ShopBrassGridProps) {
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
    const amount = (cardWidth + 16) * 3;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  }, [updateScrollState]);

  const items = hasDbProducts
    ? products.slice(0, 12)
    : placeholderBrass;

  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-screen">
        {/* Left: Carousel */}
        <div className="w-full px-6 lg:pl-8 lg:pr-12 overflow-hidden py-14 sm:py-20 flex flex-col justify-center">
          {/* Header with nav arrows */}
          <AnimateIn animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-800 tracking-[0.15em] uppercase">
                Shop Brass
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
                items.map((product) => (
                  <div key={(product as ProductListItem).id} className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start">
                    <ProductCard product={product as ProductListItem} />
                  </div>
                ))
              ) : (
                (items as typeof placeholderBrass).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/product/${item.slug}`}
                    className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start group block bg-white border border-secondary-100 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-secondary-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="200px"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium text-secondary-800 uppercase tracking-wider group-hover:text-primary-600 transition-colors">
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

          {/* Shop All Brass button */}
          <AnimateIn animation="fade-up" delay={200}>
            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-block bg-primary-500 hover:bg-primary-600 rounded-md text-white font-semibold text-sm tracking-[0.15em] uppercase px-10 py-4 transition-colors duration-200"
              >
                SHOP ALL BRASS
              </Link>
            </div>
          </AnimateIn>
        </div>

        {/* Right: Smoking brass image — 50% width, always full height */}
        <AnimateIn animation="slide-right-far" duration={1000} className="hidden lg:block relative bg-black shadow-xl overflow-hidden h-full">
          <Image
            src={`${WP_UPLOADS}2023/02/image001.jpg`}
            alt="Alpha Munitions brass casing with smoke"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </AnimateIn>
      </div>
    </section>
  );
}
