"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[product-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-secondary-900 mb-2 text-3xl font-bold">
          We couldn&apos;t load this product
        </h1>
        <p className="text-secondary-600 mx-auto mb-2 max-w-md">
          The product page hit an error. Try again, or browse our full
          catalog.
        </p>
        {error.digest && (
          <p className="text-secondary-400 mb-6 font-mono text-xs">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-xl px-6 py-3 font-semibold text-white transition-colors"
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-xl px-6 py-3 font-semibold transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
