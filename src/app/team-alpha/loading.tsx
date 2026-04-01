export default function TeamAlphaLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner header skeleton */}
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500/30" />
              <div className="skeleton h-2.5 w-16 !bg-secondary-700" />
            </div>
            <div
              className="skeleton h-10 w-56 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-80 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Team card grid skeleton */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-secondary-100 overflow-hidden"
              >
                <div
                  className="skeleton aspect-[4/3] !rounded-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
                <div className="p-6">
                  <div
                    className="skeleton h-5 w-32 mb-2"
                    style={{ animationDelay: `${60 + i * 120}ms` }}
                  />
                  <div
                    className="skeleton h-3 w-40 mb-3"
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
