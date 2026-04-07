export default function ContactLoading() {
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
              className="skeleton !bg-secondary-700 mb-4 h-10 w-52"
              style={{ animationDelay: "100ms" }}
            />
            <div
              className="skeleton !bg-secondary-700/60 h-4 w-96"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>
      </header>

      {/* Contact content skeleton */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            {/* FAQ accordion skeleton */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-secondary-200 h-px w-6" />
                <div className="skeleton h-2.5 w-24" />
              </div>
              <div
                className="skeleton mb-6 h-6 w-64"
                style={{ animationDelay: "100ms" }}
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
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-secondary-200 h-px w-6" />
                <div className="skeleton h-2.5 w-20" />
              </div>
              <div
                className="skeleton mb-6 h-6 w-40"
                style={{ animationDelay: "100ms" }}
              />
              <div className="space-y-5">
                {/* Name fields row */}
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i}>
                      <div
                        className="skeleton mb-2 h-3 w-20"
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
                    className="skeleton mb-2 h-3 w-16"
                    style={{ animationDelay: "320ms" }}
                  />
                  <div
                    className="skeleton h-11 w-full rounded"
                    style={{ animationDelay: "360ms" }}
                  />
                </div>
                {/* Subject */}
                <div>
                  <div
                    className="skeleton mb-2 h-3 w-20"
                    style={{ animationDelay: "400ms" }}
                  />
                  <div
                    className="skeleton h-11 w-full rounded"
                    style={{ animationDelay: "440ms" }}
                  />
                </div>
                {/* Message textarea */}
                <div>
                  <div
                    className="skeleton mb-2 h-3 w-20"
                    style={{ animationDelay: "480ms" }}
                  />
                  <div
                    className="skeleton h-32 w-full rounded"
                    style={{ animationDelay: "520ms" }}
                  />
                </div>
                {/* Submit button */}
                <div
                  className="skeleton h-12 w-full rounded-full"
                  style={{ animationDelay: "600ms" }}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
