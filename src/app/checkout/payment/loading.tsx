export default function CheckoutPaymentLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        {/* Step indicator skeleton */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="skeleton h-6 w-6 !rounded-full"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="skeleton h-3 w-14"
              style={{ animationDelay: "40ms" }}
            />
          </div>
          <div className="bg-secondary-200 h-px w-12" />
          <div className="flex items-center gap-2">
            <div
              className="skeleton h-6 w-6 !rounded-full"
              style={{ animationDelay: "80ms" }}
            />
            <div
              className="skeleton h-3 w-16"
              style={{ animationDelay: "120ms" }}
            />
          </div>
          <div className="bg-secondary-200 h-px w-12" />
          <div className="flex items-center gap-2 opacity-40">
            <div
              className="skeleton h-6 w-6 !rounded-full"
              style={{ animationDelay: "160ms" }}
            />
            <div
              className="skeleton h-3 w-16"
              style={{ animationDelay: "200ms" }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-8" />
            <div
              className="skeleton h-3 w-20"
              style={{ animationDelay: "240ms" }}
            />
          </div>
          <div
            className="skeleton h-10 w-40"
            style={{ animationDelay: "280ms" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Payment form */}
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                {/* Shipping form section */}
                <div
                  className="skeleton mb-6 h-4 w-36"
                  style={{ animationDelay: "320ms" }}
                />

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <div
                      className="skeleton mb-2 h-3 w-20"
                      style={{ animationDelay: "360ms" }}
                    />
                    <div
                      className="skeleton h-11 w-full !rounded-lg"
                      style={{ animationDelay: "380ms" }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <div
                      className="skeleton mb-2 h-3 w-12"
                      style={{ animationDelay: "400ms" }}
                    />
                    <div
                      className="skeleton h-11 w-full !rounded-lg"
                      style={{ animationDelay: "420ms" }}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <div
                      className="skeleton mb-2 h-3 w-16"
                      style={{ animationDelay: "440ms" }}
                    />
                    <div
                      className="skeleton h-11 w-full !rounded-lg"
                      style={{ animationDelay: "460ms" }}
                    />
                  </div>

                  {/* City / State / Zip */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div
                        className="skeleton mb-2 h-3 w-10"
                        style={{ animationDelay: "480ms" }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: "500ms" }}
                      />
                    </div>
                    <div>
                      <div
                        className="skeleton mb-2 h-3 w-12"
                        style={{ animationDelay: "520ms" }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: "540ms" }}
                      />
                    </div>
                    <div>
                      <div
                        className="skeleton mb-2 h-3 w-8"
                        style={{ animationDelay: "560ms" }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: "580ms" }}
                      />
                    </div>
                  </div>

                  {/* Payment section divider */}
                  <div className="border-secondary-100 border-t pt-5">
                    <div
                      className="skeleton mb-6 h-4 w-40"
                      style={{ animationDelay: "620ms" }}
                    />

                    {/* Card element placeholder */}
                    <div
                      className="skeleton mb-4 h-11 w-full !rounded-lg"
                      style={{ animationDelay: "660ms" }}
                    />
                    <div className="mb-5 grid grid-cols-2 gap-4">
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: "700ms" }}
                      />
                      <div
                        className="skeleton h-11 w-full !rounded-lg"
                        style={{ animationDelay: "720ms" }}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div
                    className="skeleton h-14 w-full !rounded-full"
                    style={{ animationDelay: "760ms" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <div
                    className="skeleton h-3 w-20"
                    style={{ animationDelay: "320ms" }}
                  />
                </div>
                {/* Item summaries */}
                <div className="mb-5 space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="skeleton h-10 w-10 flex-shrink-0 !rounded-lg"
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
                <div className="border-secondary-100 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <div
                      className="skeleton h-4 w-16"
                      style={{ animationDelay: "480ms" }}
                    />
                    <div
                      className="skeleton h-4 w-16"
                      style={{ animationDelay: "500ms" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <div
                      className="skeleton h-4 w-20"
                      style={{ animationDelay: "520ms" }}
                    />
                    <div
                      className="skeleton h-4 w-12"
                      style={{ animationDelay: "540ms" }}
                    />
                  </div>
                </div>
                <div className="border-secondary-100 mt-4 border-t pt-4">
                  <div className="flex items-baseline justify-between">
                    <div
                      className="skeleton h-3 w-12"
                      style={{ animationDelay: "560ms" }}
                    />
                    <div
                      className="skeleton h-7 w-20"
                      style={{ animationDelay: "580ms" }}
                    />
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
