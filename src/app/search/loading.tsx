export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="skeleton mb-3 h-3 w-20" />
        <div className="skeleton h-9 w-48" />
        <div className="bg-secondary-200 mt-3 h-[1px] w-[60px]" />
        <div
          className="skeleton mt-2 h-4 w-40 opacity-60"
          style={{ animationDelay: "100ms" }}
        />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-secondary-100 overflow-hidden rounded-lg border bg-white"
          >
            <div
              className="skeleton aspect-[2/3] !rounded-none"
              style={{ animationDelay: `${(i % 4) * 120}ms` }}
            />
            <div className="space-y-2 p-3">
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
