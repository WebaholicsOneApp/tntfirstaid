'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReviewAggregate, ReviewsResponse, ReviewSortOption } from '~/types/review';

interface ReviewsSectionProps {
  productId: number;
  aggregate: ReviewAggregate | null;
}

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
      {filled ? (
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="currentColor"
          className="text-amber-400"
        />
      ) : half ? (
        <>
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="currentColor" className="text-amber-400" />
              <stop offset="50%" stopColor="currentColor" className="text-secondary-200" />
            </linearGradient>
          </defs>
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill="url(#halfStar)"
          />
        </>
      ) : (
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="currentColor"
          className="text-secondary-200"
        />
      )}
    </svg>
  );
}

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarIcon key={i} filled={i <= Math.round(rating)} />
    );
  }
  return (
    <div className={`flex items-center gap-0.5 ${size === 'md' ? '[&_svg]:w-5 [&_svg]:h-5' : ''}`}>
      {stars}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-secondary-500 text-right">{star} star</span>
      <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-secondary-400 text-right">{count}</span>
    </div>
  );
}

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

export default function ReviewsSection({ productId, aggregate }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<ReviewSortOption>('newest');
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&page=${page}&limit=10&sort=${sort}`);
      if (res.ok) {
        const data: ReviewsResponse = await res.json();
        setReviews(data);
      }
    } catch {
      // Silently fail — empty state will show
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const agg = reviews?.aggregate ?? aggregate;
  const totalReviews = agg?.totalReviews ?? 0;

  // Empty state
  if (!loading && totalReviews === 0 && (!reviews || reviews.reviews.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-300 mb-3">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <p className="text-secondary-500 font-medium">No reviews yet</p>
        <p className="text-sm text-secondary-400 mt-1">Be the first to review this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating summary */}
      {agg && totalReviews > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="text-center sm:text-left">
            <div className="text-4xl font-bold text-secondary-800">{agg.averageRating.toFixed(1)}</div>
            <div className="mt-1">
              <StarRating rating={agg.averageRating} size="md" />
            </div>
            <p className="text-sm text-secondary-500 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-1.5">
            <RatingBar star={5} count={agg.rating5Count} total={totalReviews} />
            <RatingBar star={4} count={agg.rating4Count} total={totalReviews} />
            <RatingBar star={3} count={agg.rating3Count} total={totalReviews} />
            <RatingBar star={2} count={agg.rating2Count} total={totalReviews} />
            <RatingBar star={1} count={agg.rating1Count} total={totalReviews} />
          </div>
        </div>
      )}

      {/* Sort control */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
          <p className="text-sm text-secondary-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as ReviewSortOption); setPage(1); }}
            className="text-sm border border-secondary-200 rounded-md px-3 py-1.5 bg-white text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-2 p-4 border border-secondary-100 rounded-lg">
              <div className="h-4 bg-secondary-100 rounded w-1/4" />
              <div className="h-3 bg-secondary-100 rounded w-3/4" />
              <div className="h-3 bg-secondary-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.reviews.map(review => (
            <div key={review.id} className="p-4 border border-secondary-100 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {review.title && (
                      <span className="font-medium text-secondary-800 text-sm">{review.title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-secondary-400">
                    <span className="font-medium text-secondary-600">{review.customerName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-green-600 font-medium">Verified Purchase</span>
                    )}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {review.content && (
                <p className="mt-3 text-sm text-secondary-600 leading-relaxed">{review.content}</p>
              )}
              {review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map(img => (
                    <img
                      key={img.id}
                      src={img.thumbnailUrl || img.imageUrl}
                      alt="Review image"
                      className="w-16 h-16 object-cover rounded border border-secondary-100"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviews && reviews.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-secondary-200 rounded-md disabled:opacity-40 hover:bg-secondary-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-secondary-500">
            Page {page} of {reviews.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(reviews.pagination.totalPages, p + 1))}
            disabled={page >= reviews.pagination.totalPages}
            className="px-3 py-1.5 text-sm border border-secondary-200 rounded-md disabled:opacity-40 hover:bg-secondary-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
