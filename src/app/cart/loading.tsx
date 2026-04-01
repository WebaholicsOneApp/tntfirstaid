export default function CartLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-primary-500" />
              <div className="skeleton h-3 w-12" style={{ animationDelay: '0ms' }} />
            </div>
            <div className="skeleton h-9 w-44" style={{ animationDelay: '60ms' }} />
          </div>
          <div className="skeleton h-4 w-32" style={{ animationDelay: '120ms' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-secondary-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 sm:gap-6 py-6"
              >
                {/* Image */}
                <div
                  className="skeleton w-20 h-20 sm:w-24 sm:h-24 !rounded-xl flex-shrink-0"
                  style={{ animationDelay: `${180 + i * 120}ms` }}
                />
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div
                        className="skeleton h-4 w-3/4 mb-1"
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
            <div className="bg-white rounded-2xl border border-secondary-100 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-primary-500" />
                <div className="skeleton h-3 w-20" style={{ animationDelay: '400ms' }} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-16" style={{ animationDelay: '440ms' }} />
                  <div className="skeleton h-4 w-16" style={{ animationDelay: '460ms' }} />
                </div>
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-20" style={{ animationDelay: '480ms' }} />
                  <div className="skeleton h-4 w-12" style={{ animationDelay: '500ms' }} />
                </div>
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-16" style={{ animationDelay: '520ms' }} />
                  <div className="skeleton h-4 w-16" style={{ animationDelay: '540ms' }} />
                </div>
              </div>
              <div className="mt-5 border-t border-secondary-100 pt-5">
                <div className="flex justify-between items-baseline">
                  <div className="skeleton h-3 w-12" style={{ animationDelay: '560ms' }} />
                  <div className="skeleton h-8 w-24" style={{ animationDelay: '580ms' }} />
                </div>
              </div>
              <div
                className="skeleton h-12 w-full !rounded-full mt-8"
                style={{ animationDelay: '620ms' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
