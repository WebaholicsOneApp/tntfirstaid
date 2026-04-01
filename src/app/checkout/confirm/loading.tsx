export default function CheckoutConfirmLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        {/* Step indicator skeleton */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-6 !rounded-full" style={{ animationDelay: '0ms' }} />
            <div className="skeleton h-3 w-14" style={{ animationDelay: '40ms' }} />
          </div>
          <div className="h-px w-12 bg-secondary-200" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-6 !rounded-full" style={{ animationDelay: '80ms' }} />
            <div className="skeleton h-3 w-16" style={{ animationDelay: '120ms' }} />
          </div>
          <div className="h-px w-12 bg-secondary-200" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-6 !rounded-full" style={{ animationDelay: '160ms' }} />
            <div className="skeleton h-3 w-16" style={{ animationDelay: '200ms' }} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-8 bg-primary-500" />
            <div className="skeleton h-3 w-20" style={{ animationDelay: '240ms' }} />
          </div>
          <div className="skeleton h-10 w-52" style={{ animationDelay: '280ms' }} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Shipping + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping address card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="skeleton h-4 w-36 mb-4" style={{ animationDelay: '320ms' }} />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-40" style={{ animationDelay: '360ms' }} />
                  <div className="skeleton h-4 w-56" style={{ animationDelay: '380ms' }} />
                  <div className="skeleton h-4 w-48" style={{ animationDelay: '400ms' }} />
                  <div className="skeleton h-4 w-36" style={{ animationDelay: '420ms' }} />
                </div>
              </div>
            </div>

            {/* Items card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] border border-secondary-100/60">
                <div className="border-b border-secondary-100/60 px-6 py-4 sm:px-8">
                  <div className="skeleton h-5 w-16 !rounded-full" style={{ animationDelay: '440ms' }} />
                </div>
                <div className="divide-y divide-secondary-100/60">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-4 px-6 py-5 sm:gap-6 sm:px-8">
                      <div
                        className="skeleton h-16 w-16 !rounded-xl flex-shrink-0"
                        style={{ animationDelay: `${480 + i * 80}ms` }}
                      />
                      <div className="flex-1">
                        <div
                          className="skeleton h-4 w-3/4 mb-1"
                          style={{ animationDelay: `${500 + i * 80}ms` }}
                        />
                        <div
                          className="skeleton h-3 w-1/4"
                          style={{ animationDelay: `${520 + i * 80}ms` }}
                        />
                      </div>
                      <div
                        className="skeleton h-5 w-16 flex-shrink-0"
                        style={{ animationDelay: `${540 + i * 80}ms` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-6 bg-primary-500" />
                  <div className="skeleton h-3 w-20" style={{ animationDelay: '640ms' }} />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="skeleton h-4 w-16" style={{ animationDelay: `${680 + i * 40}ms` }} />
                      <div className="skeleton h-4 w-16" style={{ animationDelay: `${700 + i * 40}ms` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-secondary-100 pt-5">
                  <div className="flex justify-between items-baseline">
                    <div className="skeleton h-3 w-12" style={{ animationDelay: '840ms' }} />
                    <div className="skeleton h-8 w-24" style={{ animationDelay: '860ms' }} />
                  </div>
                </div>
                <div
                  className="skeleton h-14 w-full !rounded-full mt-8"
                  style={{ animationDelay: '900ms' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
