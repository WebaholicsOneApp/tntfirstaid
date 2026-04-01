export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <div className="skeleton h-3 w-16" style={{ animationDelay: '0ms' }} />
        </div>
        <div className="skeleton h-9 w-72 mb-8" style={{ animationDelay: '60ms' }} />

        {/* Account Info Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 mb-6">
          <div className="skeleton h-3 w-28 mb-4" style={{ animationDelay: '120ms' }} />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-12" style={{ animationDelay: '160ms' }} />
              <div className="skeleton h-4 w-32" style={{ animationDelay: '180ms' }} />
            </div>
            <div className="h-px bg-secondary-100" />
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-12" style={{ animationDelay: '200ms' }} />
              <div className="skeleton h-4 w-44" style={{ animationDelay: '220ms' }} />
            </div>
            <div className="h-px bg-secondary-100" />
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-14" style={{ animationDelay: '240ms' }} />
              <div className="skeleton h-4 w-28" style={{ animationDelay: '260ms' }} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
            <div className="skeleton h-3 w-16 mb-1" style={{ animationDelay: '300ms' }} />
            <div className="skeleton h-8 w-12" style={{ animationDelay: '340ms' }} />
          </div>
          <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
            <div className="skeleton h-3 w-24 mb-1" style={{ animationDelay: '360ms' }} />
            <div className="skeleton h-8 w-20" style={{ animationDelay: '400ms' }} />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className="skeleton w-10 h-10 !rounded-lg"
                  style={{ animationDelay: `${440 + i * 60}ms` }}
                />
                <div>
                  <div
                    className="skeleton h-4 w-20 mb-1"
                    style={{ animationDelay: `${460 + i * 60}ms` }}
                  />
                  <div
                    className="skeleton h-3 w-32"
                    style={{ animationDelay: `${480 + i * 60}ms` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logout button */}
        <div
          className="skeleton h-10 w-28 !rounded-full"
          style={{ animationDelay: '660ms' }}
        />
      </div>
    </div>
  );
}
