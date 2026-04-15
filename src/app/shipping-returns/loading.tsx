export default function ShippingReturnsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="skeleton h-3 w-52" />
      </div>

      {/* Hero header skeleton */}
      <div className="bg-secondary-900 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div
            className="skeleton !bg-secondary-700 mx-auto mb-4 h-10 w-80 max-w-full"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="skeleton !bg-secondary-700 mx-auto h-4 w-96 max-w-full"
            style={{ animationDelay: "80ms" }}
          />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Returns section */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "520ms" }}
              />
              <div
                className="skeleton h-7 w-52"
                style={{ animationDelay: "560ms" }}
              />
            </div>
            <div className="bg-secondary-50 border-secondary-100 space-y-8 border p-8 md:p-12">
              <div className="space-y-3">
                <div
                  className="skeleton h-6 w-56"
                  style={{ animationDelay: "600ms" }}
                />
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: "640ms" }}
                />
                <div
                  className="skeleton h-4 w-5/6"
                  style={{ animationDelay: "680ms" }}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-32 w-full !rounded-xl"
                    style={{ animationDelay: `${720 + i * 60}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Shipping policy section */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "900ms" }}
              />
              <div
                className="skeleton h-7 w-44"
                style={{ animationDelay: "940ms" }}
              />
            </div>
            <div className="bg-secondary-50 border-secondary-100 space-y-8 border p-8 md:p-12">
              <div className="space-y-3">
                <div
                  className="skeleton h-6 w-64"
                  style={{ animationDelay: "980ms" }}
                />
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: "1020ms" }}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-32 w-full !rounded-xl"
                    style={{ animationDelay: `${1060 + i * 60}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
