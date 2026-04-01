export default function ShopCategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Heading skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-6 bg-secondary-200" />
          <div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton h-9 w-32" />
        <div className="skeleton h-4 w-64 mt-3 opacity-60" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-secondary-100 bg-white overflow-hidden"
            style={{ animationDelay: `${(i % 4) * 120}ms` }}
          >
            <div
              className="skeleton aspect-[2/3] !rounded-none"
              style={{ animationDelay: `${(i % 4) * 120}ms` }}
            />
            <div className="p-3 space-y-2">
              <div
                className="skeleton h-4 w-3/4"
                style={{ animationDelay: `${(i % 4) * 120 + 60}ms` }}
              />
              <div
                className="skeleton h-4 w-1/3 opacity-70"
                style={{ animationDelay: `${(i % 4) * 120 + 120}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
