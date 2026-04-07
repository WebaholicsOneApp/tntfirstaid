"use client";

import type { ProductListItem } from "~/types";
import RecommendationCard from "./RecommendationCard";

interface RecommendationGridProps {
  products: ProductListItem[];
  loading?: boolean;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`flex-none animate-pulse ${className ?? ""}`}>
      <div className="bg-secondary-100 mb-2 aspect-square rounded-lg" />
      <div className="bg-secondary-100 mb-1.5 h-2.5 w-3/4 rounded" />
      <div className="bg-secondary-100 mb-2 h-2.5 w-1/2 rounded" />
      <div className="bg-secondary-100 h-6 w-full rounded-full" />
    </div>
  );
}

export default function RecommendationGrid({
  products,
  loading = false,
}: RecommendationGridProps) {
  if (loading) {
    return (
      <>
        {/* Mobile skeleton: horizontal scroll row */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} className="w-[44vw]" />
          ))}
        </div>
        {/* Desktop skeleton: grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
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
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-[44vw] flex-none snap-start">
            <RecommendationCard product={product} />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-5">
        {products.map((product) => (
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
