export default function CalculatorLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero header skeleton */}
      <div className="relative bg-secondary-900 min-h-[300px] md:min-h-[400px]">
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500" />
              <div
                className="skeleton h-3 w-24 !bg-secondary-700"
                style={{ animationDelay: '0ms' }}
              />
            </div>
            <div
              className="skeleton h-10 w-96 max-w-full !bg-secondary-700"
              style={{ animationDelay: '80ms' }}
            />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left column - Instructions skeleton */}
            <div>
              <div
                className="skeleton h-6 w-72 mb-4"
                style={{ animationDelay: '160ms' }}
              />
              <div className="space-y-3">
                <div className="skeleton h-4 w-full" style={{ animationDelay: '200ms' }} />
                <div className="skeleton h-4 w-5/6" style={{ animationDelay: '240ms' }} />
                <div
                  className="skeleton h-16 w-full !rounded-lg"
                  style={{ animationDelay: '280ms' }}
                />
                <div className="skeleton h-4 w-full" style={{ animationDelay: '320ms' }} />
                <div className="skeleton h-4 w-4/5" style={{ animationDelay: '360ms' }} />
                <div
                  className="skeleton h-12 w-full !rounded-lg"
                  style={{ animationDelay: '400ms' }}
                />
                <div className="skeleton h-4 w-3/4" style={{ animationDelay: '440ms' }} />
                <div
                  className="skeleton h-10 w-64 !rounded-full"
                  style={{ animationDelay: '480ms' }}
                />
              </div>
            </div>

            {/* Right column - Calculator form skeleton */}
            <div>
              <div className="bg-white rounded-2xl border border-secondary-100 p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div
                  className="skeleton h-6 w-40 mb-6"
                  style={{ animationDelay: '200ms' }}
                />
                <div className="space-y-5">
                  {/* Input fields */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div
                        className="skeleton h-3 w-28 mb-2"
                        style={{ animationDelay: `${240 + i * 60}ms` }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: `${260 + i * 60}ms` }}
                      />
                    </div>
                  ))}

                  {/* Calculate button */}
                  <div
                    className="skeleton h-12 w-full !rounded-full"
                    style={{ animationDelay: '500ms' }}
                  />

                  {/* Result area */}
                  <div className="border-t border-secondary-100 pt-5 mt-5">
                    <div
                      className="skeleton h-5 w-32 mb-3"
                      style={{ animationDelay: '540ms' }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="skeleton h-16 w-full !rounded-lg"
                          style={{ animationDelay: `${580 + i * 40}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
