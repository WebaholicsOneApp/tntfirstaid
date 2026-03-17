import { cn } from '~/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Image placeholder */}
      <div className="aspect-square bg-secondary-100 rounded-lg" />

      {/* Content */}
      <div className="mt-3 space-y-2">
        {/* Title */}
        <div className="h-4 bg-secondary-100 rounded w-3/4" />
        <div className="h-4 bg-secondary-100 rounded w-1/2" />

        {/* Price */}
        <div className="h-5 bg-secondary-100 rounded w-1/4 mt-2" />

        {/* Stock badge */}
        <div className="h-5 bg-secondary-100 rounded-full w-20" />
      </div>
    </div>
  );
}

export default function ProductCardSkeleton({ className, count = 1 }: ProductCardSkeletonProps) {
  if (count === 1) {
    return <SkeletonCard className={className} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className={className} />
      ))}
    </div>
  );
}
