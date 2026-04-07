export default function CartLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <div
                className="skeleton h-3 w-12"
                style={{ animationDelay: "0ms" }}
              />
            </div>
            <div
              className="skeleton h-9 w-44"
              style={{ animationDelay: "60ms" }}
            />
          </div>
          <div
            className="skeleton h-4 w-32"
            style={{ animationDelay: "120ms" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="divide-secondary-100 space-y-0 divide-y lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-6 sm:gap-6">
                {/* Image */}
                <div
                  className="skeleton h-20 w-20 flex-shrink-0 !rounded-xl sm:h-24 sm:w-24"
                  style={{ animationDelay: `${180 + i * 120}ms` }}
                />
                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div
                        className="skeleton mb-1 h-4 w-3/4"
                        style={{ animationDelay: `${220 + i * 120}ms` }}
                      />
                      <div
                        className="skeleton h-3 w-1/3"
                        style={{ animationDelay: `${260 + i * 120}ms` }}
                      />
                    </div>
                    <div
                      className="skeleton h-5 w-16 flex-shrink-0"
                      style={{ animationDelay: `${280 + i * 120}ms` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div
                      className="skeleton h-8 w-24 !rounded-full"
                      style={{ animationDelay: `${300 + i * 120}ms` }}
                    />
                    <div
                      className="skeleton h-8 w-8 !rounded-full"
                      style={{ animationDelay: `${320 + i * 120}ms` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <div
                  className="skeleton h-3 w-20"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div
                    className="skeleton h-4 w-16"
                    style={{ animationDelay: "440ms" }}
                  />
                  <div
                    className="skeleton h-4 w-16"
                    style={{ animationDelay: "460ms" }}
                  />
                </div>
                <div className="flex justify-between">
                  <div
                    className="skeleton h-4 w-20"
                    style={{ animationDelay: "480ms" }}
                  />
                  <div
                    className="skeleton h-4 w-12"
                    style={{ animationDelay: "500ms" }}
                  />
                </div>
                <div className="flex justify-between">
                  <div
                    className="skeleton h-4 w-16"
                    style={{ animationDelay: "520ms" }}
                  />
                  <div
                    className="skeleton h-4 w-16"
                    style={{ animationDelay: "540ms" }}
                  />
                </div>
              </div>
              <div className="border-secondary-100 mt-5 border-t pt-5">
                <div className="flex items-baseline justify-between">
                  <div
                    className="skeleton h-3 w-12"
                    style={{ animationDelay: "560ms" }}
                  />
                  <div
                    className="skeleton h-8 w-24"
                    style={{ animationDelay: "580ms" }}
                  />
                </div>
              </div>
              <div
                className="skeleton mt-8 h-12 w-full !rounded-full"
                style={{ animationDelay: "620ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
