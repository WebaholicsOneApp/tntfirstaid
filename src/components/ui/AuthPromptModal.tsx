"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "~/components/ui/Spinner";
import { useAuth } from "~/lib/auth";

type FormState = "idle" | "submitting" | "success" | "error";
type Tab = "magic-link" | "password";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  redirectPath?: string;
  onAuthenticated?: () => void;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign in to continue",
  subtitle,
  redirectPath,
  onAuthenticated,
}: AuthPromptModalProps) {
  const pathname = usePathname();
  const redirect = redirectPath ?? pathname;
  const { refreshUser } = useAuth();

  const [tab, setTab] = useState<Tab>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Reset all form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab("magic-link");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setFormState("idle");
      setErrorMessage("");
      setFieldErrors(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setFormState("idle");
    setErrorMessage("");
    setFieldErrors(new Set());
    setPassword("");
    setShowPassword(false);
  };

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
        body: JSON.stringify({ email: trimmed, redirect }),
      });
      // Always show success regardless of response (prevents email enumeration)
      setFormState("success");
    } catch {
      setFormState("success");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      const errors = new Set<string>();
      if (!trimmed) errors.add("email");
      if (!password) errors.add("password");
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
      // Hydrate customer context without page reload
      await refreshUser();
      onAuthenticated?.();
      onClose();
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className="animate-in zoom-in-95 slide-in-from-bottom-2 relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-secondary-400 hover:text-secondary-600 absolute top-4 right-4 p-1 transition-colors duration-200"
          aria-label="Close"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h3 className="font-display text-secondary-900 mb-1 pr-8 text-lg font-bold">
          {title}
        </h3>
        {subtitle && (
          <p className="text-secondary-500 mb-4 text-sm">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-4" />}

        {/* Tab toggle */}
        <div className="bg-secondary-50 mb-5 flex rounded-lg p-1">
          <button
            onClick={() => switchTab("magic-link")}
            className={`flex-1 rounded-md py-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 ${
              tab === "magic-link"
                ? "text-secondary-900 bg-white shadow-sm"
                : "text-secondary-400 hover:text-secondary-600"
            }`}
          >
            Email Link
          </button>
          <button
            onClick={() => switchTab("password")}
            className={`flex-1 rounded-md py-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 ${
              tab === "password"
                ? "text-secondary-900 bg-white shadow-sm"
                : "text-secondary-400 hover:text-secondary-600"
            }`}
          >
            Password
          </button>
        </div>

        {/* ── Magic Link Tab ── */}
        {tab === "magic-link" && (
          <>
            {formState === "success" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
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
                      <span className="font-medium">{email}</span>, we&apos;ve
                      sent a sign-in link. It expires in 15 minutes.
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

                <p className="text-secondary-400 text-xs">
                  No password needed — we&apos;ll email you a secure link.
                </p>
              </>
            )}
          </>
        )}

        {/* ── Password Tab ── */}
        {tab === "password" && (
          <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-login-email"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                Email Address
              </label>
              <input
                id="modal-login-email"
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
                className={`w-full border ${fieldErrors.has("email") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="modal-login-password"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="modal-login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.size)
                      setFieldErrors((prev) => {
                        const n = new Set(prev);
                        n.delete("password");
                        return n;
                      });
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full border ${fieldErrors.has("password") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 pr-12 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-secondary-400 hover:text-secondary-600 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {formState === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
}
