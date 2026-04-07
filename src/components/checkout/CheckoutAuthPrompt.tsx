"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";

type FormState = "idle" | "submitting" | "success" | "error";

interface CheckoutAuthPromptProps {
  onGuestCheckout: () => void;
  onAuthCheckout: () => void;
  isLoading: boolean;
  expressCheckoutSlot?: ReactNode;
}

export default function CheckoutAuthPrompt({
  onGuestCheckout,
  onAuthCheckout,
  isLoading,
  expressCheckoutSlot,
}: CheckoutAuthPromptProps) {
  const { isAuthenticated, customerAuthEnabled, customer, refreshUser } =
    useAuth();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // When user verifies magic link in another tab and comes back, refresh auth state
  useEffect(() => {
    const handleFocus = () => {
      refreshUser();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshUser]);

  // Auth disabled — render express checkout slot + checkout button directly
  if (!customerAuthEnabled) {
    return (
      <>
        {expressCheckoutSlot}
        <button
          onClick={onGuestCheckout}
          disabled={isLoading}
          className="bg-primary-500 text-secondary-950 hover:bg-primary-400 mt-4 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Proceed to Checkout
            </>
          )}
        </button>
      </>
    );
  }

  // Logged in — show account info + checkout button
  if (isAuthenticated && customer) {
    const addr = customer.defaultAddress;

    return (
      <div className="border-secondary-100 mt-6 rounded-2xl border p-6">
        {/* Eyebrow */}
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
            Account
          </span>
        </div>

        {/* Signed-in info */}
        <div className="mb-1 flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
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
          <div className="min-w-0">
            <p className="text-secondary-900 text-sm font-medium">
              Signed in as {customer.email}
            </p>
            <p className="text-secondary-500 text-sm">
              {customer.firstName} {customer.lastName}
            </p>
            {addr && (
              <p className="text-secondary-400 mt-0.5 text-xs">
                {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
              </p>
            )}
          </div>
        </div>

        <p className="text-secondary-400 mt-3 mb-4 text-xs">
          Your info will be pre-filled at checkout.
        </p>

        {/* Express checkout slot */}
        {expressCheckoutSlot}

        {/* Proceed button */}
        <button
          onClick={onAuthCheckout}
          disabled={isLoading}
          className="bg-primary-500 text-secondary-950 hover:bg-primary-400 mt-4 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Proceed to Checkout
            </>
          )}
        </button>
      </div>
    );
  }

  // Not logged in + auth enabled — magic link prompt
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors(new Set(["email"]));
      setFormState("error");
      setErrorMessage("Please enter your email address.");
      return;
    }
    setFieldErrors(new Set());
    setFormState("submitting");
    setErrorMessage("");
    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      // Always show success regardless of response (prevents email enumeration)
      setFormState("success");
    } catch {
      setFormState("success"); // Still show success
    }
  };

  return (
    <div className="border-secondary-100 mt-6 rounded-2xl border p-6">
      {/* Eyebrow */}
      <div className="mb-2 flex items-center gap-3">
        <div className="bg-primary-500 h-px w-6" />
        <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Account
        </span>
      </div>

      <h3 className="font-display text-secondary-900 mb-1 text-lg font-bold">
        Sign in for faster checkout
      </h3>
      <p className="text-secondary-500 mb-4 text-sm">
        Save your info, track orders, and speed up future purchases.
      </p>

      {/* Magic link form / success state */}
      {formState === "success" ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">
                Check your email
              </p>
              <p className="mt-0.5 text-xs text-green-600">
                If an account exists for{" "}
                <span className="font-medium">{email}</span>, we&apos;ve sent a
                sign-in link. It expires in 15 minutes.
              </p>
              <button
                onClick={() => {
                  setFormState("idle");
                  setEmail("");
                }}
                className="mt-2 text-xs font-medium text-green-700 transition-colors hover:text-green-800"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleMagicLink}
            noValidate
            className="mb-3 flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.size)
                  setFieldErrors((prev) => {
                    const n = new Set(prev);
                    n.delete("email");
                    return n;
                  });
              }}
              autoComplete="email"
              placeholder="you@example.com"
              className={`min-w-0 flex-1 border ${fieldErrors.has("email") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
            />
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex items-center gap-1.5 rounded-lg px-4 py-3 font-mono text-[0.65rem] tracking-[0.1em] whitespace-nowrap uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formState === "submitting" ? <Spinner /> : "Send Link"}
            </button>
          </form>

          {formState === "error" && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </>
      )}

      {/* Password login link */}
      <p className="text-secondary-400 mb-4 text-xs">
        Already have a password?{" "}
        <Link
          href="/account?redirect=/checkout"
          className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
        >
          Sign in &rarr;
        </Link>
      </p>

      {/* Divider */}
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-secondary-100 h-px flex-1" />
        <span className="text-secondary-300 text-xs">or</span>
        <div className="bg-secondary-100 h-px flex-1" />
      </div>

      {/* Express checkout slot */}
      {expressCheckoutSlot}

      {/* Continue as Guest */}
      <button
        onClick={onGuestCheckout}
        disabled={isLoading}
        className="border-secondary-200 text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          "Continue as Guest"
        )}
      </button>
    </div>
  );
}
