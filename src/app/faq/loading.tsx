export default function FaqLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb skeleton */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="skeleton h-3 w-10" />
          <div className="h-3 w-px bg-secondary-200" />
          <div
            className="skeleton h-3 w-20"
            style={{ animationDelay: '60ms' }}
          />
        </div>
      </nav>

      {/* Light header skeleton (FAQ uses bg-white, not dark banner) */}
      <header className="bg-white border-b border-secondary-100">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-secondary-200" />
            <div className="skeleton h-2.5 w-20" />
          </div>
          <div
            className="skeleton h-10 w-96 mb-4"
            style={{ animationDelay: '100ms' }}
          />
          <div
            className="skeleton h-4 w-80 opacity-60"
            style={{ animationDelay: '200ms' }}
          />
        </div>
      </header>

      {/* Accordion sections skeleton */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {Array.from({ length: 4 }).map((_, s) => (
              <section key={s}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-6 bg-secondary-200" />
                  <div
                    className="skeleton h-2.5 w-16"
                    style={{ animationDelay: `${s * 150}ms` }}
                  />
                </div>
                <div
                  className="skeleton h-5 w-48 mb-6"
                  style={{ animationDelay: `${s * 150 + 60}ms` }}
                />
                <div className="space-y-3">
                  {Array.from({ length: s === 0 ? 3 : 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="skeleton h-12 rounded border border-secondary-50"
                      style={{ animationDelay: `${s * 150 + 120 + i * 80}ms` }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Quick links CTA skeleton */}
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-8 border border-secondary-100 text-center"
              >
                <div
                  className="skeleton w-12 h-12 rounded mx-auto mb-4"
                  style={{ animationDelay: `${800 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-3 w-20 mx-auto mb-2"
                  style={{ animationDelay: `${860 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-3 w-36 mx-auto"
                  style={{ animationDelay: `${920 + i * 120}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
