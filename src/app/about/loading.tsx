export default function AboutLoading() {
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
              className="skeleton h-10 w-72 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-80 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Who We Are section skeleton */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6 bg-secondary-200" />
                <div className="skeleton h-2.5 w-16" />
              </div>
              <div
                className="skeleton h-8 w-48 mb-6"
                style={{ animationDelay: '100ms' }}
              />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-4"
                    style={{
                      animationDelay: `${200 + i * 80}ms`,
                      width: i === 4 ? '60%' : '100%',
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="skeleton aspect-[4/3]"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </section>

      {/* Values cards skeleton */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div className="h-px w-6 bg-secondary-200" />
              <div className="skeleton h-2.5 w-20" />
            </div>
            <div
              className="skeleton h-8 w-40 mx-auto"
              style={{ animationDelay: '100ms' }}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-secondary-50 p-8 border border-secondary-100 text-center"
              >
                <div
                  className="skeleton w-16 h-16 rounded mx-auto mb-6"
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-5 w-28 mx-auto mb-3"
                  style={{ animationDelay: `${260 + i * 120}ms` }}
                />
                <div className="space-y-2">
                  <div
                    className="skeleton h-3 w-full"
                    style={{ animationDelay: `${320 + i * 120}ms` }}
                  />
                  <div
                    className="skeleton h-3 w-5/6 mx-auto"
                    style={{ animationDelay: `${380 + i * 120}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
