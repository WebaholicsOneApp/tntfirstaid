export default function CheckoutSuccessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-lg text-center">
        {/* Checkmark placeholder */}
        <div
          className="skeleton mx-auto mb-8 h-20 w-20 !rounded-full"
          style={{ animationDelay: "0ms" }}
        />

        {/* Thank you heading */}
        <div
          className="skeleton mx-auto mb-3 h-9 w-64"
          style={{ animationDelay: "100ms" }}
        />

        {/* Subtext */}
        <div
          className="skeleton mx-auto mb-2 h-4 w-80 max-w-full"
          style={{ animationDelay: "180ms" }}
        />
        <div
          className="skeleton mx-auto mb-8 h-4 w-56"
          style={{ animationDelay: "240ms" }}
        />

        {/* Order number card */}
        <div className="border-secondary-100 mb-8 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div
            className="skeleton mx-auto mb-3 h-3 w-28"
            style={{ animationDelay: "300ms" }}
          />
          <div
            className="skeleton mx-auto mb-4 h-8 w-36"
            style={{ animationDelay: "360ms" }}
          />
          <div
            className="skeleton mx-auto h-3 w-52"
            style={{ animationDelay: "420ms" }}
          />
        </div>

        {/* Continue shopping button */}
        <div
          className="skeleton mx-auto h-12 w-56 !rounded-full"
          style={{ animationDelay: "480ms" }}
        />
      </div>
    </div>
  );
}
