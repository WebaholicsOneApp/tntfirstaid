export default function CheckoutPaymentLoading() {
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
          <div className="flex items-center gap-2 opacity-40">
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
          <div className="skeleton h-10 w-40" style={{ animationDelay: '280ms' }} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Payment form */}
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                {/* Shipping form section */}
                <div className="skeleton h-4 w-36 mb-6" style={{ animationDelay: '320ms' }} />

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <div className="skeleton h-3 w-20 mb-2" style={{ animationDelay: '360ms' }} />
                    <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '380ms' }} />
                  </div>

                  {/* Email */}
                  <div>
                    <div className="skeleton h-3 w-12 mb-2" style={{ animationDelay: '400ms' }} />
                    <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '420ms' }} />
                  </div>

                  {/* Address */}
                  <div>
                    <div className="skeleton h-3 w-16 mb-2" style={{ animationDelay: '440ms' }} />
                    <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '460ms' }} />
                  </div>

                  {/* City / State / Zip */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="skeleton h-3 w-10 mb-2" style={{ animationDelay: '480ms' }} />
                      <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '500ms' }} />
                    </div>
                    <div>
                      <div className="skeleton h-3 w-12 mb-2" style={{ animationDelay: '520ms' }} />
                      <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '540ms' }} />
                    </div>
                    <div>
                      <div className="skeleton h-3 w-8 mb-2" style={{ animationDelay: '560ms' }} />
                      <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '580ms' }} />
                    </div>
                  </div>

                  {/* Payment section divider */}
                  <div className="border-t border-secondary-100 pt-5">
                    <div className="skeleton h-4 w-40 mb-6" style={{ animationDelay: '620ms' }} />

                    {/* Card element placeholder */}
                    <div
                      className="skeleton h-11 w-full !rounded-lg mb-4"
                      style={{ animationDelay: '660ms' }}
                    />
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: '700ms' }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: '720ms' }}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div
                    className="skeleton h-14 w-full !rounded-full"
                    style={{ animationDelay: '760ms' }}
                  />
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
                  <div className="skeleton h-3 w-20" style={{ animationDelay: '320ms' }} />
                </div>
                {/* Item summaries */}
                <div className="space-y-3 mb-5">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="skeleton h-10 w-10 !rounded-lg flex-shrink-0"
                        style={{ animationDelay: `${360 + i * 60}ms` }}
                      />
                      <div className="flex-1">
                        <div
                          className="skeleton h-3 w-3/4"
                          style={{ animationDelay: `${380 + i * 60}ms` }}
                        />
                      </div>
                      <div
                        className="skeleton h-3 w-12 flex-shrink-0"
                        style={{ animationDelay: `${400 + i * 60}ms` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="border-t border-secondary-100 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-16" style={{ animationDelay: '480ms' }} />
                    <div className="skeleton h-4 w-16" style={{ animationDelay: '500ms' }} />
                  </div>
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-20" style={{ animationDelay: '520ms' }} />
                    <div className="skeleton h-4 w-12" style={{ animationDelay: '540ms' }} />
                  </div>
                </div>
                <div className="mt-4 border-t border-secondary-100 pt-4">
                  <div className="flex justify-between items-baseline">
                    <div className="skeleton h-3 w-12" style={{ animationDelay: '560ms' }} />
                    <div className="skeleton h-7 w-20" style={{ animationDelay: '580ms' }} />
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
