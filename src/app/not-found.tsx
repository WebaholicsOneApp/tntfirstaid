import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="bg-primary-50 mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full">
          <svg
            className="text-primary-300 h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="font-display text-secondary-900 mb-2 text-5xl font-bold">
          404
        </h1>
        <h2 className="text-secondary-700 mb-4 text-xl font-semibold">
          Page Not Found
        </h2>
        <p className="mx-auto mb-8 max-w-md text-gray-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or doesn&apos;t exist.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="bg-primary-500 hover:bg-primary-600 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-xl px-6 py-3 font-semibold transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
