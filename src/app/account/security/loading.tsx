export default function SecurityLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className="skeleton h-4 w-4 !rounded"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "20ms" }}
          />
          <div
            className="skeleton h-3 w-2"
            style={{ animationDelay: "40ms" }}
          />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "60ms" }}
          />
        </div>

        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <div
            className="skeleton h-3 w-16"
            style={{ animationDelay: "80ms" }}
          />
        </div>
        <div
          className="skeleton mb-8 h-9 w-28"
          style={{ animationDelay: "120ms" }}
        />

        {/* Password form card */}
        <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
          <div
            className="skeleton mb-6 h-4 w-36"
            style={{ animationDelay: "160ms" }}
          />

          <div className="space-y-5">
            {/* Current password */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-32"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="skeleton h-11 w-full !rounded-lg"
                style={{ animationDelay: "220ms" }}
              />
            </div>

            {/* New password */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-28"
                style={{ animationDelay: "260ms" }}
              />
              <div
                className="skeleton h-11 w-full !rounded-lg"
                style={{ animationDelay: "280ms" }}
              />
            </div>

            {/* Confirm password */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-36"
                style={{ animationDelay: "320ms" }}
              />
              <div
                className="skeleton h-11 w-full !rounded-lg"
                style={{ animationDelay: "340ms" }}
              />
            </div>

            {/* Save button */}
            <div
              className="skeleton h-12 w-full !rounded-full"
              style={{ animationDelay: "380ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
