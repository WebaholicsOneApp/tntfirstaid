export default function CalculatorLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero header skeleton */}
      <div className="bg-secondary-900 relative min-h-[300px] md:min-h-[400px]">
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <div
                className="skeleton !bg-secondary-700 h-3 w-24"
                style={{ animationDelay: "0ms" }}
              />
            </div>
            <div
              className="skeleton !bg-secondary-700 h-10 w-96 max-w-full"
              style={{ animationDelay: "80ms" }}
            />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left column - Instructions skeleton */}
            <div>
              <div
                className="skeleton mb-4 h-6 w-72"
                style={{ animationDelay: "160ms" }}
              />
              <div className="space-y-3">
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: "200ms" }}
                />
                <div
                  className="skeleton h-4 w-5/6"
                  style={{ animationDelay: "240ms" }}
                />
                <div
                  className="skeleton h-16 w-full !rounded-lg"
                  style={{ animationDelay: "280ms" }}
                />
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: "320ms" }}
                />
                <div
                  className="skeleton h-4 w-4/5"
                  style={{ animationDelay: "360ms" }}
                />
                <div
                  className="skeleton h-12 w-full !rounded-lg"
                  style={{ animationDelay: "400ms" }}
                />
                <div
                  className="skeleton h-4 w-3/4"
                  style={{ animationDelay: "440ms" }}
                />
                <div
                  className="skeleton h-10 w-64 !rounded-full"
                  style={{ animationDelay: "480ms" }}
                />
              </div>
            </div>

            {/* Right column - Calculator form skeleton */}
            <div>
              <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
                <div
                  className="skeleton mb-6 h-6 w-40"
                  style={{ animationDelay: "200ms" }}
                />
                <div className="space-y-5">
                  {/* Input fields */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div
                        className="skeleton mb-2 h-3 w-28"
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
                    style={{ animationDelay: "500ms" }}
                  />

                  {/* Result area */}
                  <div className="border-secondary-100 mt-5 border-t pt-5">
                    <div
                      className="skeleton mb-3 h-5 w-32"
                      style={{ animationDelay: "540ms" }}
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
