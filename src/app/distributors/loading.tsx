export default function DistributorsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner header skeleton */}
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500/30 h-px w-6" />
              <div className="skeleton !bg-secondary-700 h-2.5 w-24" />
            </div>
            <div
              className="skeleton !bg-secondary-700 mb-4 h-10 w-80"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="skeleton !bg-secondary-700/60 h-4 w-96"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>
      </header>

      {/* Distributor content skeleton */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Country group skeletons */}
          {Array.from({ length: 3 }).map((_, g) => (
            <section key={g}>
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="skeleton h-8 w-8 rounded"
                  style={{ animationDelay: `${g * 200}ms` }}
                />
                <div
                  className="skeleton h-6 w-40"
                  style={{ animationDelay: `${g * 200 + 60}ms` }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: g === 0 ? 6 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-secondary-100 space-y-3 border bg-white p-5"
                  >
                    <div
                      className="skeleton h-4 w-36"
                      style={{ animationDelay: `${g * 200 + (i % 3) * 120}ms` }}
                    />
                    <div
                      className="skeleton h-3 w-full opacity-60"
                      style={{
                        animationDelay: `${g * 200 + (i % 3) * 120 + 60}ms`,
                      }}
                    />
                    <div
                      className="skeleton h-3 w-28 opacity-60"
                      style={{
                        animationDelay: `${g * 200 + (i % 3) * 120 + 120}ms`,
                      }}
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
