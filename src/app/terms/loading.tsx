export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="skeleton h-3 w-36" />
      </div>

      {/* Hero header skeleton */}
      <div className="bg-secondary-900 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div
            className="skeleton !bg-secondary-700 mx-auto mb-4 h-10 w-72"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="skeleton !bg-secondary-700 mx-auto h-4 w-96 max-w-full"
            style={{ animationDelay: "80ms" }}
          />
          <div
            className="skeleton !bg-secondary-800 mx-auto mt-4 h-3 w-40"
            style={{ animationDelay: "160ms" }}
          />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Section 1 */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="skeleton h-7 w-48"
                style={{ animationDelay: "240ms" }}
              />
            </div>
            <div className="bg-secondary-50 border-secondary-100 space-y-4 border p-8 md:p-12">
              <div
                className="skeleton h-4 w-full"
                style={{ animationDelay: "280ms" }}
              />
              <div
                className="skeleton h-4 w-5/6"
                style={{ animationDelay: "320ms" }}
              />
              <div
                className="skeleton h-4 w-4/5"
                style={{ animationDelay: "360ms" }}
              />
              <div
                className="skeleton h-4 w-3/4"
                style={{ animationDelay: "400ms" }}
              />
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "440ms" }}
              />
              <div
                className="skeleton h-7 w-40"
                style={{ animationDelay: "480ms" }}
              />
            </div>
            <div className="border-secondary-100 space-y-4 border bg-white p-8">
              <div
                className="skeleton h-4 w-full"
                style={{ animationDelay: "520ms" }}
              />
              <div className="space-y-3 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-4 w-5/6"
                    style={{ animationDelay: `${560 + i * 40}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "760ms" }}
              />
              <div
                className="skeleton h-7 w-52"
                style={{ animationDelay: "800ms" }}
              />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-secondary-100 space-y-3 border bg-white p-8"
                >
                  <div
                    className="skeleton h-5 w-40"
                    style={{ animationDelay: `${840 + i * 80}ms` }}
                  />
                  <div
                    className="skeleton h-4 w-full"
                    style={{ animationDelay: `${880 + i * 80}ms` }}
                  />
                  <div
                    className="skeleton h-4 w-4/5"
                    style={{ animationDelay: `${920 + i * 80}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="skeleton h-12 w-12 !rounded"
                style={{ animationDelay: "1080ms" }}
              />
              <div
                className="skeleton h-7 w-56"
                style={{ animationDelay: "1120ms" }}
              />
            </div>
            <div className="bg-secondary-50 border-secondary-100 space-y-4 border p-8 md:p-12">
              <div
                className="skeleton h-4 w-full"
                style={{ animationDelay: "1160ms" }}
              />
              <div
                className="skeleton h-4 w-5/6"
                style={{ animationDelay: "1200ms" }}
              />
              <div
                className="skeleton h-4 w-4/5"
                style={{ animationDelay: "1240ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
