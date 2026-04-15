"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner className="text-primary-500 h-6 w-6" />
      </div>
    );
  }

  if (isAuthenticated) {
    router.replace("/account/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ email: trimmed, redirect: "/account/security" }),
      });
      // Always show success regardless of response (prevents email enumeration)
      setFormState("success");
    } catch {
      setFormState("success");
    }
  };

  // Success state
  if (formState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-md">
          <div className="border-secondary-100 rounded-2xl border bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10">
            <div className="mb-6 flex justify-center">
              <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary-500 h-8 w-8"
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
              </div>
            </div>
            <h2 className="font-display text-secondary-900 mb-2 text-xl font-bold">
              Check Your Email
            </h2>
            <p className="text-secondary-500 mb-6 text-sm">
              If an account exists for{" "}
              <span className="text-secondary-700 font-medium">{email}</span>,
              we&apos;ve sent a link to reset your password. It expires in 15
              minutes.
            </p>
            <p className="text-secondary-400 mb-6 text-xs">
              Don&apos;t see it? Check your spam folder.
            </p>
            <Link
              href="/account"
              className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="border-secondary-100 rounded-2xl border bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10">
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

          {/* Eyebrow + title */}
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Account
            </span>
          </div>
          <h1 className="font-display text-secondary-900 mb-2 text-2xl font-bold">
            Reset Password
          </h1>
          <p className="text-secondary-500 mb-6 text-sm">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="reset-email"
                className="text-secondary-400 mb-2 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => {
                    const next = new Set(prev);
                    next.delete("email");
                    return next;
                  });
                }}
                autoComplete="email"
                placeholder="you@example.com"
                className={`text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${fieldErrors.has("email") ? "border-red-400" : "border-secondary-200"}`}
              />
            </div>

            {formState === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="bg-primary-500 text-secondary-950 hover:bg-primary-400 mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formState === "submitting" ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        </div>

        <p className="text-secondary-500 mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link
            href="/account"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
