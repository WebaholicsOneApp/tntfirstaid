export default function NewsLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner header skeleton */}
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500/30" />
              <div className="skeleton h-2.5 w-20 !bg-secondary-700" />
            </div>
            <div
              className="skeleton h-10 w-56 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-96 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Article grid skeleton — 2x3 */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-secondary-100 overflow-hidden"
              >
                <div
                  className="skeleton aspect-[16/10] !rounded-none"
                  style={{ animationDelay: `${(i % 3) * 120}ms` }}
                />
                <div className="p-5 space-y-3">
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
