export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Heading skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-6 bg-secondary-200" />
          <div className="h-3 w-20 bg-secondary-100 rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-secondary-100 rounded animate-pulse" />
        <div className="h-4 w-64 bg-secondary-50 rounded animate-pulse mt-3" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-secondary-100 rounded mb-3" />
            <div className="h-4 w-3/4 bg-secondary-100 rounded mb-2" />
            <div className="h-4 w-1/3 bg-secondary-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
