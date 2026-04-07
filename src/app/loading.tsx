export default function HomeLoading() {
  return (
    <div className="bg-secondary-950 min-h-screen">
      {/* Full-screen dark hero placeholder */}
      <div className="bg-secondary-950 h-screen" />

      {/* Section strips to suggest content loading */}
      <div className="bg-secondary-900 py-6">
        <div className="container mx-auto flex justify-center gap-12 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton !bg-secondary-700 h-4 w-24"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div
            className="skeleton mx-auto mb-4 h-8 w-48"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="skeleton mx-auto mb-12 h-4 w-96"
            style={{ animationDelay: "200ms" }}
          />
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton h-48 rounded-lg"
                style={{ animationDelay: `${300 + i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-secondary-50 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div
            className="skeleton mx-auto mb-12 h-8 w-56"
            style={{ animationDelay: "400ms" }}
          />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div
                  className="skeleton mb-3 aspect-[2/3] rounded-lg"
                  style={{ animationDelay: `${500 + i * 120}ms` }}
                />
                <div
                  className="skeleton mb-2 h-4 w-3/4"
                  style={{ animationDelay: `${560 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-4 w-1/3"
                  style={{ animationDelay: `${620 + i * 120}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
