export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-4 w-4 !rounded" style={{ animationDelay: '0ms' }} />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '20ms' }} />
          <div className="skeleton h-3 w-2" style={{ animationDelay: '40ms' }} />
          <div className="skeleton h-3 w-14" style={{ animationDelay: '60ms' }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '80ms' }} />
        </div>
        <div className="skeleton h-9 w-28 mb-8" style={{ animationDelay: '120ms' }} />

        {/* Profile form card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
          <div className="skeleton h-3 w-36 mb-6" style={{ animationDelay: '160ms' }} />

          <div className="space-y-5">
            {/* Name fields row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="skeleton h-3 w-20 mb-2" style={{ animationDelay: '200ms' }} />
                <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '220ms' }} />
              </div>
              <div>
                <div className="skeleton h-3 w-20 mb-2" style={{ animationDelay: '240ms' }} />
                <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '260ms' }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="skeleton h-3 w-12 mb-2" style={{ animationDelay: '280ms' }} />
              <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Phone */}
            <div>
              <div className="skeleton h-3 w-14 mb-2" style={{ animationDelay: '320ms' }} />
              <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '340ms' }} />
            </div>

            {/* Address section */}
            <div className="border-t border-secondary-100 pt-5">
              <div className="skeleton h-4 w-32 mb-4" style={{ animationDelay: '360ms' }} />

              {/* Address line 1 */}
              <div className="mb-4">
                <div className="skeleton h-3 w-24 mb-2" style={{ animationDelay: '380ms' }} />
                <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '400ms' }} />
              </div>

              {/* Address line 2 */}
              <div className="mb-4">
                <div className="skeleton h-3 w-28 mb-2" style={{ animationDelay: '420ms' }} />
                <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '440ms' }} />
              </div>

              {/* City / State / Zip row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="skeleton h-3 w-10 mb-2" style={{ animationDelay: '460ms' }} />
                  <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '480ms' }} />
                </div>
                <div>
                  <div className="skeleton h-3 w-12 mb-2" style={{ animationDelay: '500ms' }} />
                  <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '520ms' }} />
                </div>
                <div>
                  <div className="skeleton h-3 w-16 mb-2" style={{ animationDelay: '540ms' }} />
                  <div className="skeleton h-11 w-full !rounded-lg" style={{ animationDelay: '560ms' }} />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div
              className="skeleton h-12 w-full !rounded-full"
              style={{ animationDelay: '600ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
