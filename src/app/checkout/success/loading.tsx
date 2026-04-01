export default function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Checkmark placeholder */}
        <div
          className="skeleton w-20 h-20 !rounded-full mx-auto mb-8"
          style={{ animationDelay: '0ms' }}
        />

        {/* Thank you heading */}
        <div
          className="skeleton h-9 w-64 mx-auto mb-3"
          style={{ animationDelay: '100ms' }}
        />

        {/* Subtext */}
        <div
          className="skeleton h-4 w-80 max-w-full mx-auto mb-2"
          style={{ animationDelay: '180ms' }}
        />
        <div
          className="skeleton h-4 w-56 mx-auto mb-8"
          style={{ animationDelay: '240ms' }}
        />

        {/* Order number card */}
        <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] mb-8">
          <div
            className="skeleton h-3 w-28 mx-auto mb-3"
            style={{ animationDelay: '300ms' }}
          />
          <div
            className="skeleton h-8 w-36 mx-auto mb-4"
            style={{ animationDelay: '360ms' }}
          />
          <div
            className="skeleton h-3 w-52 mx-auto"
            style={{ animationDelay: '420ms' }}
          />
        </div>

        {/* Continue shopping button */}
        <div
          className="skeleton h-12 w-56 !rounded-full mx-auto"
          style={{ animationDelay: '480ms' }}
        />
      </div>
    </div>
  );
}
