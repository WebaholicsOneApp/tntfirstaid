export default function AboutLoading() {
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
              className="skeleton !bg-secondary-700 mb-4 h-10 w-72"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="skeleton !bg-secondary-700/60 h-4 w-80"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>
      </header>

      {/* Who We Are section skeleton */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-secondary-200 h-px w-6" />
                <div className="skeleton h-2.5 w-16" />
              </div>
              <div
                className="skeleton mb-6 h-8 w-48"
                style={{ animationDelay: "100ms" }}
              />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-4"
                    style={{
                      animationDelay: `${200 + i * 80}ms`,
                      width: i === 4 ? "60%" : "100%",
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="skeleton aspect-[4/3]"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </section>

      {/* Values cards skeleton */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="bg-secondary-200 h-px w-6" />
              <div className="skeleton h-2.5 w-20" />
            </div>
            <div
              className="skeleton mx-auto h-8 w-40"
              style={{ animationDelay: "100ms" }}
            />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-secondary-50 border-secondary-100 border p-8 text-center"
              >
                <div
                  className="skeleton mx-auto mb-6 h-16 w-16 rounded"
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                />
                <div
                  className="skeleton mx-auto mb-3 h-5 w-28"
                  style={{ animationDelay: `${260 + i * 120}ms` }}
                />
                <div className="space-y-2">
                  <div
                    className="skeleton h-3 w-full"
                    style={{ animationDelay: `${320 + i * 120}ms` }}
                  />
                  <div
                    className="skeleton mx-auto h-3 w-5/6"
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
