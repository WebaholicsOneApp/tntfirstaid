"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "~/components/ui/Spinner";

type VerifyState = "verifying" | "success" | "error" | "no-token";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect");
  const [state, setState] = useState<VerifyState>(
    token ? "verifying" : "no-token",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setErrorMessage(
            data.error || "This link is invalid or has already been used.",
          );
          setState("error");
          return;
        }
        setState("success");
        // Small delay so user sees success before redirect
        setTimeout(() => {
          window.location.href = redirect || "/account/dashboard";
        }, 800);
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setState("error");
      }
    })();
  }, [token, redirect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="border-secondary-100 rounded-2xl border bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/tnt-logo.png"
              alt="TNT First Aid"
              width={300}
              height={50}
              className="h-auto w-[160px]"
            />
          </div>

          {/* Verifying */}
          {state === "verifying" && (
            <>
              <div className="mb-6 flex justify-center">
                <Spinner className="text-primary-500 h-8 w-8" />
              </div>
              <h2 className="font-display text-secondary-900 mb-2 text-xl font-bold">
                Verifying your link…
              </h2>
              <p className="text-secondary-500 text-sm">
                Please wait while we sign you in.
              </p>
            </>
          )}

          {/* Success */}
          {state === "success" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-secondary-900 mb-2 text-xl font-bold">
                You&apos;re signed in!
              </h2>
              <p className="text-secondary-500 text-sm">
                Redirecting to your account…
              </p>
            </>
          )}

          {/* Error */}
          {state === "error" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-secondary-900 mb-2 text-xl font-bold">
                Link Invalid
              </h2>
              <p className="text-secondary-500 mb-6 text-sm">{errorMessage}</p>
              <Link
                href="/account"
                className="bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-block rounded-full px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                Request a new link
              </Link>
            </>
          )}

          {/* No token */}
          {state === "no-token" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="bg-secondary-50 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-secondary-400 h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-secondary-900 mb-2 text-xl font-bold">
                Invalid Link
              </h2>
              <p className="text-secondary-500 mb-6 text-sm">
                This sign-in link appears to be incomplete or malformed.
              </p>
              <Link
                href="/account"
                className="bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-block rounded-full px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                Go to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
