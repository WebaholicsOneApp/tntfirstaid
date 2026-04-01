export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-secondary-100">
          {/* Logo skeleton */}
          <div className="flex justify-center mb-8">
            <div
              className="skeleton h-8 w-40"
              style={{ animationDelay: '0ms' }}
            />
          </div>

          {/* Eyebrow + title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-6 bg-primary-500" />
            <div
              className="skeleton h-3 w-16"
              style={{ animationDelay: '60ms' }}
            />
          </div>
          <div
            className="skeleton h-7 w-24 mb-6"
            style={{ animationDelay: '120ms' }}
          />

          {/* Tab toggle skeleton */}
          <div
            className="skeleton h-10 w-full !rounded-lg mb-6"
            style={{ animationDelay: '180ms' }}
          />

          {/* Email input */}
          <div className="space-y-5">
            <div>
              <div
                className="skeleton h-3 w-28 mb-2"
                style={{ animationDelay: '240ms' }}
              />
              <div
                className="skeleton h-11 w-full !rounded-lg"
                style={{ animationDelay: '280ms' }}
              />
            </div>

            {/* Button */}
            <div
              className="skeleton h-12 w-full !rounded-full"
              style={{ animationDelay: '320ms' }}
            />

            {/* Help text */}
            <div
              className="skeleton h-3 w-64 mx-auto"
              style={{ animationDelay: '360ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
