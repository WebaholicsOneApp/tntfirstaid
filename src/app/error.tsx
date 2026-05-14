"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.814-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="font-display text-secondary-900 mb-2 text-4xl font-bold">
          Something went wrong
        </h1>
        <p className="text-secondary-600 mx-auto mb-2 max-w-md">
          We hit an unexpected error loading this page. Try again, or head back
          home.
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
            href="/"
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-xl px-6 py-3 font-semibold transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
