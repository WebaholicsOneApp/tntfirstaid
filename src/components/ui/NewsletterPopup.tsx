"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Spinner } from "~/components/ui/Spinner";
import { useAuth } from "~/lib/auth";

type FormState = "idle" | "submitting" | "success" | "error";

const LS_KEY = "alpha-newsletter-dismissed";
const DISMISS_VERSION = 1;
const SHOW_DELAY_MS = 3_000;

/** Routes where the popup should never appear */
const BLOCKED_PREFIXES = ["/checkout", "/auth"];

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.dismissed === true && parsed?.version === DISMISS_VERSION;
  } catch {
    return false;
  }
}

function persistDismissal() {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        dismissed: true,
        dismissedAt: new Date().toISOString(),
        version: DISMISS_VERSION,
      }),
    );
  } catch {
    // localStorage may be unavailable
  }
}

export default function NewsletterPopup() {
  const pathname = usePathname();
  const { customer } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // Determine if popup should show after delay
  useEffect(() => {
    if (BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (isDismissed()) return;

    const timer = setTimeout(() => {
      if (!isDismissed()) setIsVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Pre-fill from authenticated customer
  useEffect(() => {
    if (customer?.email && !email) setEmail(customer.email);
    if (customer?.firstName && !firstName) setFirstName(customer.firstName);
  }, [customer, email, firstName]);

  // Lock body scroll when visible
  useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible]);

  // Escape key handler
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  const dismiss = useCallback(() => {
    setIsVisible(false);
    persistDismissal();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldErrors(new Set(["email"]));
      setFormState("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setFieldErrors(new Set());
    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          firstName: firstName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setFormState("success");
      persistDismissal();

      // Auto-close after success
      setTimeout(() => setIsVisible(false), 2_000);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="animate-popup-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="animate-popup-enter relative grid w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: Image Panel ── */}
        <div className="relative hidden md:block">
          <Image
            src="/images/about/shooting.jpg"
            alt="TNT First Aid"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 0vw"
            priority
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.15) 50%)",
            }}
          />
          {/* Logo at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Image
              src="/images/alpha-logo-wide.png"
              alt="TNT First Aid"
              width={180}
              height={28}
              className="opacity-80"
            />
          </div>
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="bg-secondary-950 relative flex flex-col justify-center p-7 sm:p-8">
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1 text-white/30 transition-colors duration-200 hover:text-white/60"
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

          {formState === "success" ? (
            <div className="py-6 text-center">
              <div className="bg-primary-500/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <svg
                  className="text-primary-500 h-7 w-7"
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
              <h3 className="font-display text-lg font-bold text-white">
                You&apos;re subscribed!
              </h3>
              <p className="mt-1 text-sm text-white/50">
                We&apos;ll keep you in the loop.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-5 pr-8">
                <h3 className="font-display text-xl font-bold text-white">
                  Stay in the Loop
                </h3>
                <div
                  className="bg-primary-500 mt-2 mb-3 h-px w-12"
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary-500), transparent)",
                  }}
                />
                <p className="text-sm leading-relaxed text-white/50">
                  New products, restock alerts, and technical data — delivered to
                  your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                {/* First name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="newsletter-first-name"
                    className="block font-mono text-[0.55rem] tracking-[0.3em] text-white/30 uppercase"
                  >
                    First Name{" "}
                    <span className="normal-case tracking-normal text-white/20">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="newsletter-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder="John"
                    className="w-full rounded-lg border border-white/[0.10] bg-white/[0.08] px-4 py-3 text-sm text-white/90 placeholder:text-white/30 transition-all duration-200 focus:border-[var(--primary-500)]/40 focus:ring-2 focus:ring-[var(--primary-500)]/10 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="newsletter-email"
                    className="block font-mono text-[0.55rem] tracking-[0.3em] text-white/30 uppercase"
                  >
                    Email Address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.has("email")) {
                        setFieldErrors((prev) => {
                          const n = new Set(prev);
                          n.delete("email");
                          return n;
                        });
                      }
                    }}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full rounded-lg border ${fieldErrors.has("email") ? "border-red-500/50" : "border-white/[0.10]"} bg-white/[0.08] px-4 py-3 text-sm text-white/90 placeholder:text-white/30 transition-all duration-200 focus:border-[var(--primary-500)]/40 focus:ring-2 focus:ring-[var(--primary-500)]/10 focus:outline-none`}
                  />
                </div>

                {formState === "error" && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Subscribe button */}
                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-mono text-[0.6rem] font-medium tracking-[0.2em] uppercase transition-all duration-200 hover:shadow-[0_0_20px_rgba(233,195,96,0.2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formState === "submitting" ? (
                    <>
                      <Spinner />
                      Subscribing…
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>

              {/* Dismiss link */}
              <button
                onClick={dismiss}
                className="mt-3 w-full text-center text-xs text-white/25 transition-colors duration-200 hover:text-white/50"
              >
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
