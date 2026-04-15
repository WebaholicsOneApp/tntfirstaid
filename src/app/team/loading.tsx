export default function TeamAlphaLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner header skeleton */}
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500/30 h-px w-6" />
              <div className="skeleton !bg-secondary-700 h-2.5 w-16" />
            </div>
            <div
              className="skeleton !bg-secondary-700 mb-4 h-10 w-56"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="skeleton !bg-secondary-700/60 h-4 w-80"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>
      </header>

      {/* Team card grid skeleton */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-secondary-100 overflow-hidden border bg-white"
              >
                <div
                  className="skeleton aspect-[4/3] !rounded-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
                <div className="p-6">
                  <div
                    className="skeleton mb-2 h-5 w-32"
                    style={{ animationDelay: `${60 + i * 120}ms` }}
                  />
                  <div
                    className="skeleton mb-3 h-3 w-40"
                    style={{ animationDelay: `${120 + i * 120}ms` }}
                  />
                  <div className="space-y-2">
                    <div
                      className="skeleton h-3 w-full"
                      style={{ animationDelay: `${180 + i * 120}ms` }}
                    />
                    <div
                      className="skeleton h-3 w-4/5"
                      style={{ animationDelay: `${240 + i * 120}ms` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
