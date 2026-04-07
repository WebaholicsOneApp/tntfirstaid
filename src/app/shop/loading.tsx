export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Heading skeleton */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-secondary-200 h-px w-6" />
          <div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton h-9 w-32" />
        <div className="skeleton mt-3 h-4 w-64 opacity-60" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="border-secondary-100 overflow-hidden rounded-lg border bg-white"
            style={{ animationDelay: `${(i % 4) * 120}ms` }}
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
