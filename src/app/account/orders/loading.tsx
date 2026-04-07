export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className="skeleton h-4 w-4 !rounded"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "20ms" }}
          />
          <div
            className="skeleton h-3 w-2"
            style={{ animationDelay: "40ms" }}
          />
          <div
            className="skeleton h-3 w-14"
            style={{ animationDelay: "60ms" }}
          />
        </div>

        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "80ms" }}
          />
        </div>
        <div
          className="skeleton mb-8 h-9 w-48"
          style={{ animationDelay: "120ms" }}
        />

        {/* Order rows */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border-secondary-100 rounded-2xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
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
              <div className="mt-3 flex gap-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div
                    key={j}
                    className="skeleton h-12 w-12 !rounded-lg"
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
