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
    <div className="space-y-1">
      {ratingCounts.map(({ stars, count }) => {
        const percentage = aggregate.totalReviews > 0
          ? Math.round((count / aggregate.totalReviews) * 100)
          : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const isActive = activeFilter === stars;

        return (
          <button
            key={stars}
            onClick={() => onFilterClick?.(isActive ? null : stars)}
            disabled={!onFilterClick}
            className={`w-full flex items-center gap-2 py-0.5 px-1.5 rounded transition-colors ${
              onFilterClick ? 'hover:bg-secondary-100 cursor-pointer' : 'cursor-default'
            } ${isActive ? 'bg-secondary-200' : ''}`}
          >
            {/* Star label */}
            <span className="text-xs font-medium text-secondary-700 w-10 text-left">
              {stars} star{stars !== 1 ? 's' : ''}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-1.5 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            {/* Count and percentage */}
            <div className="flex items-center gap-1 w-16 justify-end">
              <span className="text-xs text-secondary-600">{count}</span>
              <span className="text-[10px] text-secondary-400 w-8 text-right">({percentage}%)</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
