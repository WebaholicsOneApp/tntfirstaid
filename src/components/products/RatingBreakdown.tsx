'use client';

import type { ReviewAggregate } from '~/types/review';

interface RatingBreakdownProps {
  aggregate: ReviewAggregate;
  onFilterClick?: (rating: number | null) => void;
  activeFilter?: number | null;
}

export default function RatingBreakdown({
  aggregate,
  onFilterClick,
  activeFilter,
}: RatingBreakdownProps) {
  const ratingCounts = [
    { stars: 5, count: aggregate.rating5Count },
    { stars: 4, count: aggregate.rating4Count },
    { stars: 3, count: aggregate.rating3Count },
    { stars: 2, count: aggregate.rating2Count },
    { stars: 1, count: aggregate.rating1Count },
  ];

  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  return (
    <div className="space-y-1.5">
      {ratingCounts.map(({ stars, count }) => {
        const percentage =
          aggregate.totalReviews > 0
            ? Math.round((count / aggregate.totalReviews) * 100)
            : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const isActive = activeFilter === stars;

        return (
          <button
            key={stars}
            onClick={() => onFilterClick?.(isActive ? null : stars)}
            disabled={!onFilterClick}
            className={`w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg
              transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                onFilterClick
                  ? 'hover:bg-secondary-50 cursor-pointer'
                  : 'cursor-default'
              } ${
                isActive
                  ? 'bg-primary-50/50 ring-1 ring-primary-200/50'
                  : ''
              }`}
          >
            {/* Star label */}
            <span className="text-xs font-medium text-secondary-600 w-8 text-right tabular-nums">
              {stars}
            </span>
            <svg
              className="w-3.5 h-3.5 text-amber-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Progress bar */}
            <div className="flex-1 h-2.5 bg-secondary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            {/* Count and percentage */}
            <div className="flex items-center gap-1.5 w-16 justify-end">
              <span className="text-xs font-medium text-secondary-600 tabular-nums">
                {count}
              </span>
              <span className="text-[10px] text-secondary-400 w-8 text-right tabular-nums">
                ({percentage}%)
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
