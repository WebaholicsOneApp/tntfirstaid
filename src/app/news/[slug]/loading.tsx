export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Dark bar behind fixed header */}
      <div className="bg-secondary-900 h-20" />

      <main className="container mx-auto px-4 pt-10 pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Back link skeleton */}
          <div className="skeleton mb-8 h-4 w-36" />

          {/* Title skeleton */}
          <div
            className="skeleton mb-3 h-10 w-full"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="skeleton mb-6 h-10 w-3/4"
            style={{ animationDelay: "150ms" }}
          />

          {/* Meta line skeleton */}
          <div className="mb-10 flex items-center gap-4">
            <div
              className="skeleton h-3 w-24"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="skeleton h-3 w-20"
              style={{ animationDelay: "250ms" }}
            />
            <div
              className="skeleton h-6 w-16 rounded-full"
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Featured image skeleton */}
          <div
            className="skeleton mb-12 aspect-[16/9] rounded-xl"
            style={{ animationDelay: "350ms" }}
          />

          {/* Paragraph skeletons */}
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                />
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: `${440 + i * 100}ms` }}
                />
                <div
                  className="skeleton h-4 w-full"
                  style={{ animationDelay: `${480 + i * 100}ms` }}
                />
                <div
                  className="skeleton h-4"
                  style={{
                    animationDelay: `${520 + i * 100}ms`,
                    width: i % 2 === 0 ? "85%" : "70%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
