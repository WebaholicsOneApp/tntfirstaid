export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-4 w-4 !rounded" style={{ animationDelay: '0ms' }} />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '20ms' }} />
          <div className="skeleton h-3 w-2" style={{ animationDelay: '40ms' }} />
          <div className="skeleton h-3 w-14" style={{ animationDelay: '60ms' }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '80ms' }} />
        </div>
        <div className="skeleton h-9 w-48 mb-8" style={{ animationDelay: '120ms' }} />

        {/* Order rows */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="skeleton h-5 w-24"
                    style={{ animationDelay: `${160 + i * 120}ms` }}
                  />
                  <div
                    className="skeleton h-5 w-16 !rounded-full"
                    style={{ animationDelay: `${180 + i * 120}ms` }}
                  />
                </div>
                <div
                  className="skeleton h-4 w-20"
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div
                  className="skeleton h-3 w-28"
                  style={{ animationDelay: `${220 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-5 w-16"
                  style={{ animationDelay: `${240 + i * 120}ms` }}
                />
              </div>
              {/* Item thumbnails row */}
              <div className="flex gap-2 mt-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div
                    key={j}
                    className="skeleton w-12 h-12 !rounded-lg"
                    style={{ animationDelay: `${260 + i * 120 + j * 40}ms` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
