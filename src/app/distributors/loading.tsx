export default function DistributorsLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner header skeleton */}
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500/30" />
              <div className="skeleton h-2.5 w-24 !bg-secondary-700" />
            </div>
            <div
              className="skeleton h-10 w-80 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-96 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Distributor content skeleton */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Country group skeletons */}
          {Array.from({ length: 3 }).map((_, g) => (
            <section key={g}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="skeleton h-8 w-8 rounded"
                  style={{ animationDelay: `${g * 200}ms` }}
                />
                <div
                  className="skeleton h-6 w-40"
                  style={{ animationDelay: `${g * 200 + 60}ms` }}
                />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: g === 0 ? 6 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-secondary-100 p-5 space-y-3"
                  >
                    <div
                      className="skeleton h-4 w-36"
                      style={{ animationDelay: `${g * 200 + (i % 3) * 120}ms` }}
                    />
                    <div
                      className="skeleton h-3 w-full opacity-60"
                      style={{ animationDelay: `${g * 200 + (i % 3) * 120 + 60}ms` }}
                    />
                    <div
                      className="skeleton h-3 w-28 opacity-60"
                      style={{ animationDelay: `${g * 200 + (i % 3) * 120 + 120}ms` }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
