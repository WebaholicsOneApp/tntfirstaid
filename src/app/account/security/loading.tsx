export default function SecurityLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-4 w-4 !rounded" style={{ animationDelay: '0ms' }} />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '20ms' }} />
          <div className="skeleton h-3 w-2" style={{ animationDelay: '40ms' }} />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '60ms' }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '80ms' }} />
        </div>
        <div className="skeleton h-9 w-28 mb-8" style={{ animationDelay: '120ms' }} />

        {/* Password form card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
          <div className="skeleton h-4 w-36 mb-6" style={{ animationDelay: '160ms' }} />

          <div className="space-y-5">
            {/* Current password */}
            <div>
              <div className="skeleton h-3 w-32 mb-2" style={{ animationDelay: '200ms' }} />
              <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '220ms' }} />
            </div>

            {/* New password */}
            <div>
              <div className="skeleton h-3 w-28 mb-2" style={{ animationDelay: '260ms' }} />
              <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '280ms' }} />
            </div>

            {/* Confirm password */}
            <div>
              <div className="skeleton h-3 w-36 mb-2" style={{ animationDelay: '320ms' }} />
              <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '340ms' }} />
            </div>

            {/* Save button */}
            <div
              className="skeleton h-12 w-full !rounded-full"
              style={{ animationDelay: '380ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
