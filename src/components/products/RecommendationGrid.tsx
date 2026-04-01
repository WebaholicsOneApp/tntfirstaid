'use client';

import type { ProductListItem } from '~/types';
import RecommendationCard from './RecommendationCard';

interface RecommendationGridProps {
  products: ProductListItem[];
  loading?: boolean;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`flex-none animate-pulse ${className ?? ''}`}>
      <div className="aspect-square bg-secondary-100 rounded-lg mb-2" />
      <div className="h-2.5 bg-secondary-100 rounded w-3/4 mb-1.5" />
      <div className="h-2.5 bg-secondary-100 rounded w-1/2 mb-2" />
      <div className="h-6 bg-secondary-100 rounded-full w-full" />
    </div>
  );
}

export default function RecommendationGrid({ products, loading = false }: RecommendationGridProps) {
  if (loading) {
    return (
      <>
        {/* Mobile skeleton: horizontal scroll row */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
          {[0, 1, 2].map(i => (
            <SkeletonCard key={i} className="w-[44vw]" />
          ))}
        </div>
        {/* Desktop skeleton: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      {/* Mobile: horizontal scroll carousel */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {products.map(product => (
          <div key={product.id} className="snap-start flex-none w-[44vw]">
            <RecommendationCard product={product} />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {products.map(product => (
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
