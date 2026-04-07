"use client";

import { useState, useEffect } from "react";

interface RatingBadgeProps {
  productId: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

interface AggregateData {
  totalReviews: number;
  averageRating: number;
}

// Simple in-memory cache to avoid refetching on re-renders
const ratingCache = new Map<number, AggregateData>();

export default function RatingBadge({
  productId,
  size = "sm",
  showCount = true,
}: RatingBadgeProps) {
  const [aggregate, setAggregate] = useState<AggregateData | null>(
    ratingCache.get(productId) || null,
  );
  const [loading, setLoading] = useState(!ratingCache.has(productId));

  useEffect(() => {
    // Skip if already cached
    if (ratingCache.has(productId)) {
      setAggregate(ratingCache.get(productId)!);
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/reviews/product/${productId}?limit=1`);
        if (res.ok) {
          const data = await res.json();
          const aggData: AggregateData = {
            totalReviews: data.aggregate?.totalReviews || 0,
            averageRating: data.aggregate?.averageRating || 0,
          };
          ratingCache.set(productId, aggData);
          setAggregate(aggData);
        }
      } catch (error) {
        console.error("Failed to fetch rating:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [productId]);

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Use default values if no aggregate data
  const displayData = aggregate || { totalReviews: 0, averageRating: 0 };

  const sizeClasses = {
    sm: {
      star: "w-3 h-3",
      text: "text-[10px]",
      gap: "gap-0.5",
    },
    md: {
      star: "w-4 h-4",
      text: "text-xs",
      gap: "gap-1",
    },
  };

  const { star, text, gap } = sizeClasses[size];

  // Generate stars
  const rating = Number(displayData.averageRating);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Stars */}
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg
            key={`full-${i}`}
            className={`${star} text-amber-400`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <svg
            key="half"
            className={`${star} text-amber-400`}
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id={`half-${productId}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#half-${productId})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={`${star} text-secondary-300`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Rating value, reviews count */}
      {showCount && (
        <span className={`${text} text-secondary-500 font-medium`}>
          {displayData.totalReviews > 0 ? (
            <>
              {Number(displayData.averageRating).toFixed(1)}
              <span className="text-secondary-400 ml-1">
                ({displayData.totalReviews}{" "}
                {displayData.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span className="text-secondary-400">No reviews yet</span>
          )}
        </span>
      )}
    </div>
  );
}
