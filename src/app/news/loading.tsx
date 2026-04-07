export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner header skeleton */}
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500/30 h-px w-6" />
              <div className="skeleton !bg-secondary-700 h-2.5 w-20" />
            </div>
            <div
              className="skeleton !bg-secondary-700 mb-4 h-10 w-56"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="skeleton !bg-secondary-700/60 h-4 w-96"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>
      </header>

      {/* Article grid skeleton — 2x3 */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-secondary-100 overflow-hidden border bg-white"
              >
                <div
                  className="skeleton aspect-[16/10] !rounded-none"
                  style={{ animationDelay: `${(i % 3) * 120}ms` }}
                />
                <div className="space-y-3 p-5">
                  <div
                    className="skeleton h-3 w-20"
                    style={{ animationDelay: `${(i % 3) * 120 + 60}ms` }}
                  />
                  <div
                    className="skeleton h-5 w-full"
                    style={{ animationDelay: `${(i % 3) * 120 + 120}ms` }}
                  />
                  <div
                    className="skeleton h-5 w-3/4"
                    style={{ animationDelay: `${(i % 3) * 120 + 180}ms` }}
                  />
                  <div
                    className="skeleton h-3 w-full opacity-60"
                    style={{ animationDelay: `${(i % 3) * 120 + 240}ms` }}
                  />
                  <div
                    className="skeleton h-3 w-2/3 opacity-60"
                    style={{ animationDelay: `${(i % 3) * 120 + 300}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
