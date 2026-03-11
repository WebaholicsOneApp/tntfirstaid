import { cn } from '~/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

export default function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
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
