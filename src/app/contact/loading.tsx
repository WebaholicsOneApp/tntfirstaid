export default function ContactLoading() {
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
              className="skeleton h-10 w-52 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-96 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Contact content skeleton */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* FAQ accordion skeleton */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6 bg-secondary-200" />
                <div className="skeleton h-2.5 w-24" />
              </div>
              <div
                className="skeleton h-6 w-64 mb-6"
                style={{ animationDelay: '100ms' }}
              />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-12 rounded"
                    style={{ animationDelay: `${200 + i * 80}ms` }}
                  />
                ))}
              </div>
            </section>

            {/* Form skeleton */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6 bg-secondary-200" />
                <div className="skeleton h-2.5 w-20" />
              </div>
              <div
                className="skeleton h-6 w-40 mb-6"
                style={{ animationDelay: '100ms' }}
              />
              <div className="space-y-5">
                {/* Name fields row */}
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i}>
                      <div
                        className="skeleton h-3 w-20 mb-2"
                        style={{ animationDelay: `${200 + i * 60}ms` }}
                      />
                      <div
                        className="skeleton h-11 w-full rounded"
                        style={{ animationDelay: `${240 + i * 60}ms` }}
                      />
                    </div>
                  ))}
                </div>
                {/* Email */}
                <div>
                  <div
                    className="skeleton h-3 w-16 mb-2"
                    style={{ animationDelay: '320ms' }}
                  />
                  <div
                    className="skeleton h-11 w-full rounded"
                    style={{ animationDelay: '360ms' }}
                  />
                </div>
                {/* Subject */}
                <div>
                  <div
                    className="skeleton h-3 w-20 mb-2"
                    style={{ animationDelay: '400ms' }}
                  />
                  <div
                    className="skeleton h-11 w-full rounded"
                    style={{ animationDelay: '440ms' }}
                  />
                </div>
                {/* Message textarea */}
                <div>
                  <div
                    className="skeleton h-3 w-20 mb-2"
                    style={{ animationDelay: '480ms' }}
                  />
                  <div
                    className="skeleton h-32 w-full rounded"
                    style={{ animationDelay: '520ms' }}
                  />
                </div>
                {/* Submit button */}
                <div
                  className="skeleton h-12 w-full rounded-full"
                  style={{ animationDelay: '600ms' }}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
