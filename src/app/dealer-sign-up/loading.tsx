export default function DealerSignUpLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner header skeleton */}
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500/30" />
              <div className="skeleton h-2.5 w-24 !bg-secondary-700" />
            </div>
            <div
              className="skeleton h-10 w-60 !bg-secondary-700 mb-4"
              style={{ animationDelay: '100ms' }}
            />
            <div
              className="skeleton h-4 w-96 !bg-secondary-700/60"
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </div>
      </header>

      {/* Form skeleton */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Name fields row */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div
                  className="skeleton h-3 w-24 mb-2"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <div
                  className="skeleton h-11 w-full rounded"
                  style={{ animationDelay: `${40 + i * 60}ms` }}
                />
              </div>
            ))}
          </div>
          {/* Single-line fields */}
          {['Email', 'Phone', 'Company', 'Website'].map((_, i) => (
            <div key={i}>
              <div
                className="skeleton h-3 w-20 mb-2"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              />
              <div
                className="skeleton h-11 w-full rounded"
                style={{ animationDelay: `${160 + i * 80}ms` }}
              />
            </div>
          ))}
          {/* Textarea */}
          <div>
            <div
              className="skeleton h-3 w-28 mb-2"
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
      </main>
    </div>
  );
}
