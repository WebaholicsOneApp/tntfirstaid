import { cn } from "~/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Image placeholder */}
      <div className="bg-secondary-100 aspect-square rounded-lg" />

      {/* Content */}
      <div className="mt-3 space-y-2">
        {/* Title */}
        <div className="bg-secondary-100 h-4 w-3/4 rounded" />
        <div className="bg-secondary-100 h-4 w-1/2 rounded" />

        {/* Price */}
        <div className="bg-secondary-100 mt-2 h-5 w-1/4 rounded" />

        {/* Stock badge */}
        <div className="bg-secondary-100 h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function ProductCardSkeleton({
  className,
  count = 1,
}: ProductCardSkeletonProps) {
  if (count === 1) {
    return <SkeletonCard className={className} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className={className} />
      ))}
    </div>
  );
}
