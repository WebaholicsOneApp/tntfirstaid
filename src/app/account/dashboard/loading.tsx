export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "0ms" }}
          />
        </div>
        <div
          className="skeleton mb-8 h-9 w-72"
          style={{ animationDelay: "60ms" }}
        />

        {/* Account Info Card */}
        <div className="border-secondary-100 mb-6 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
          <div
            className="skeleton mb-4 h-3 w-28"
            style={{ animationDelay: "120ms" }}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div
                className="skeleton h-4 w-12"
                style={{ animationDelay: "160ms" }}
              />
              <div
                className="skeleton h-4 w-32"
                style={{ animationDelay: "180ms" }}
              />
            </div>
            <div className="bg-secondary-100 h-px" />
            <div className="flex items-center justify-between">
              <div
                className="skeleton h-4 w-12"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="skeleton h-4 w-44"
                style={{ animationDelay: "220ms" }}
              />
            </div>
            <div className="bg-secondary-100 h-px" />
            <div className="flex items-center justify-between">
              <div
                className="skeleton h-4 w-14"
                style={{ animationDelay: "240ms" }}
              />
              <div
                className="skeleton h-4 w-28"
                style={{ animationDelay: "260ms" }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="border-secondary-100 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div
              className="skeleton mb-1 h-3 w-16"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="skeleton h-8 w-12"
              style={{ animationDelay: "340ms" }}
            />
          </div>
          <div className="border-secondary-100 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div
              className="skeleton mb-1 h-3 w-24"
              style={{ animationDelay: "360ms" }}
            />
            <div
              className="skeleton h-8 w-20"
              style={{ animationDelay: "400ms" }}
            />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border-secondary-100 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="skeleton h-10 w-10 !rounded-lg"
                  style={{ animationDelay: `${440 + i * 60}ms` }}
                />
                <div>
                  <div
                    className="skeleton mb-1 h-4 w-20"
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
          style={{ animationDelay: "660ms" }}
        />
      </div>
    </div>
  );
}
