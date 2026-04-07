export default function ReviewLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Product image + name */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div
              className="skeleton mx-auto mb-4 h-24 w-24 !rounded-xl"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="skeleton mx-auto mb-2 h-5 w-48"
              style={{ animationDelay: "80ms" }}
            />
            <div
              className="skeleton mx-auto h-3 w-32"
              style={{ animationDelay: "120ms" }}
            />
          </div>

          {/* Star rating skeleton */}
          <div className="px-8 py-4 text-center">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-8 w-8 !rounded"
                  style={{ animationDelay: `${160 + i * 40}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-5 px-8 pb-8">
            <div className="border-secondary-100 border-t" />

            {/* Title input */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-28"
                style={{ animationDelay: "360ms" }}
              />
              <div
                className="skeleton h-11 w-full !rounded-xl"
                style={{ animationDelay: "400ms" }}
              />
            </div>

            {/* Textarea */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-24"
                style={{ animationDelay: "440ms" }}
              />
              <div
                className="skeleton h-24 w-full !rounded-xl"
                style={{ animationDelay: "480ms" }}
              />
            </div>

            {/* Photo upload */}
            <div>
              <div
                className="skeleton mb-2 h-3 w-24"
                style={{ animationDelay: "520ms" }}
              />
              <div
                className="skeleton h-9 w-32 !rounded-lg"
                style={{ animationDelay: "560ms" }}
              />
            </div>

            {/* Submit button */}
            <div
              className="skeleton h-12 w-full !rounded-xl"
              style={{ animationDelay: "600ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
