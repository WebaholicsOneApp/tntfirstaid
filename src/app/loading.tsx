export default function HomeLoading() {
  return (
    <div className="bg-secondary-950 min-h-screen">
      {/* Full-screen dark hero placeholder */}
      <div className="h-screen bg-secondary-950" />

      {/* Section strips to suggest content loading */}
      <div className="bg-secondary-900 py-6">
        <div className="container mx-auto px-4 flex justify-center gap-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-4 w-24 !bg-secondary-700"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div
            className="skeleton h-8 w-48 mx-auto mb-4"
            style={{ animationDelay: '100ms' }}
          />
          <div
            className="skeleton h-4 w-96 mx-auto mb-12"
            style={{ animationDelay: '200ms' }}
          />
          <div className="grid md:grid-cols-3 gap-8">
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div
            className="skeleton h-8 w-56 mx-auto mb-12"
            style={{ animationDelay: '400ms' }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div
                  className="skeleton aspect-[2/3] rounded-lg mb-3"
                  style={{ animationDelay: `${500 + i * 120}ms` }}
                />
                <div
                  className="skeleton h-4 w-3/4 mb-2"
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
