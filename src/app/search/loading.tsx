export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="skeleton h-3 w-20 mb-3" />
        <div className="skeleton h-9 w-48" />
        <div className="mt-3 h-[1px] w-[60px] bg-secondary-200" />
        <div className="skeleton h-4 w-40 mt-2 opacity-60" style={{ animationDelay: '100ms' }} />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-secondary-100 bg-white overflow-hidden"
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
