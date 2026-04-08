"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";

type Tab = "magic-link" | "password";
type FormState = "idle" | "submitting" | "success" | "error";

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/dashboard";
  const {
    isAuthenticated,
    isLoading: authLoading,
    customerAuthEnabled,
  } = useAuth();
  const [tab, setTab] = useState<Tab>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // Wait for client-side auth hydration before deciding
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner className="text-primary-500 h-6 w-6" />
      </div>
    );
  }

  // Redirect authenticated users to their destination
  if (isAuthenticated) {
    router.replace(redirectTo);
    return null;
  }

  // If auth is disabled, show a simple message
  if (!customerAuthEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
        <div className="text-center">
          <p className="text-secondary-500 text-sm">
            Customer accounts are not available at this time.
          </p>
          <Link
            href="/"
            className="text-primary-500 hover:text-primary-400 mt-2 inline-block text-sm"
          >
            Return to shop →
          </Link>
        </div>
      </div>
    );
  }

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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const errors = new Set<string>();
    if (!trimmed) errors.add("email");
    if (!password) errors.add("password");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setFormState("error");
      setErrorMessage("Please enter your email and password.");
      return;
    }
    setFieldErrors(new Set());
    setFormState("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Invalid email or password.");
      }
      window.location.href = redirectTo;
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  // Success state after magic link request
  if (formState === "success" && tab === "magic-link") {
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
              we&apos;ve sent a sign-in link. It expires in 15 minutes.
            </p>
            <p className="text-secondary-400 mb-6 text-xs">
              Don&apos;t see it? Check your spam folder.
            </p>
            <button
              onClick={() => {
                setFormState("idle");
                setEmail("");
              }}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
            >
              ← Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="border-secondary-100 rounded-2xl border bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
              alt="Alpha Munitions"
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
          <h1 className="font-display text-secondary-900 mb-6 text-2xl font-bold">
            Sign In
          </h1>

          {/* Tab toggle */}
          <div className="bg-secondary-50 mb-6 flex rounded-lg p-1">
            <button
              onClick={() => {
                setTab("magic-link");
                setFormState("idle");
                setErrorMessage("");
                setFieldErrors(new Set());
              }}
              className={`flex-1 rounded-md py-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 ${
                tab === "magic-link"
                  ? "text-secondary-900 bg-white shadow-sm"
                  : "text-secondary-400 hover:text-secondary-600"
              }`}
            >
              Email Link
            </button>
            <button
              onClick={() => {
                setTab("password");
                setFormState("idle");
                setErrorMessage("");
                setFieldErrors(new Set());
              }}
              className={`flex-1 rounded-md py-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 ${
                tab === "password"
                  ? "text-secondary-900 bg-white shadow-sm"
                  : "text-secondary-400 hover:text-secondary-600"
              }`}
            >
              Password
            </button>
          </div>

          {/* Magic Link Form */}
          {tab === "magic-link" && (
            <form onSubmit={handleMagicLink} noValidate className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="magic-email"
                  className="text-secondary-400 mb-2 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
                >
                  Email Address
                </label>
                <input
                  id="magic-email"
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
                    Sending…
                  </>
                ) : (
                  "Email me a sign-in link"
                )}
              </button>

              <p className="text-secondary-400 text-center text-xs">
                No password needed — we&apos;ll email you a secure link.
              </p>
            </form>
          )}

          {/* Password Form */}
          {tab === "password" && (
            <form
              onSubmit={handlePasswordLogin}
              noValidate
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="text-secondary-400 mb-2 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
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

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => {
                        const next = new Set(prev);
                        next.delete("password");
                        return next;
                      });
                    }}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${fieldErrors.has("password") ? "border-red-400" : "border-secondary-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-secondary-400 hover:text-secondary-600 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/account/forgot-password"
                  className="text-primary-500 hover:text-primary-400 text-sm transition-colors"
                >
                  Forgot password?
                </Link>
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
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Dealer link */}
        <p className="text-secondary-500 mt-4 text-center text-sm">
          Not a customer?{" "}
          <Link
            href="/dealer-sign-up"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Apply as a dealer →
          </Link>
        </p>
      </div>
    </div>
  );
}
