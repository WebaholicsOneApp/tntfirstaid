export default function AccountLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="border-secondary-100 rounded-2xl border bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10">
          {/* Logo skeleton */}
          <div className="mb-8 flex justify-center">
            <div
              className="skeleton h-8 w-40"
              style={{ animationDelay: "0ms" }}
            />
          </div>

          {/* Eyebrow + title */}
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <div
              className="skeleton h-3 w-16"
              style={{ animationDelay: "60ms" }}
            />
          </div>
          <div
            className="skeleton mb-6 h-7 w-24"
            style={{ animationDelay: "120ms" }}
          />

          {/* Tab toggle skeleton */}
          <div
            className="skeleton mb-6 h-10 w-full !rounded-lg"
            style={{ animationDelay: "180ms" }}
          />

          {/* Email input */}
          <div className="space-y-5">
            <div>
              <div
                className="skeleton mb-2 h-3 w-28"
                style={{ animationDelay: "240ms" }}
              />
              <div
                className="skeleton h-11 w-full !rounded-lg"
                style={{ animationDelay: "280ms" }}
              />
            </div>

            {/* Button */}
            <div
              className="skeleton h-12 w-full !rounded-full"
              style={{ animationDelay: "320ms" }}
            />

            {/* Help text */}
            <div
              className="skeleton mx-auto h-3 w-64"
              style={{ animationDelay: "360ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
