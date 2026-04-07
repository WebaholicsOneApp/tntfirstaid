"use client";

import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";

interface DashboardClientProps {
  showPasswordPrompt?: boolean;
  showLogout?: boolean;
}

export default function DashboardClient({
  showPasswordPrompt,
  showLogout,
}: DashboardClientProps) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Password form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwState, setPwState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [pwError, setPwError] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setPwState("error");
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPwState("error");
      setPwError("Passwords do not match.");
      return;
    }
    setPwState("submitting");
    setPwError("");
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to set password.");
      }
      setPwState("success");
    } catch (err) {
      setPwState("error");
      setPwError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (showPasswordPrompt) {
    if (pwState === "success") {
      return (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-green-500"
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
            <p className="text-sm font-medium text-green-700">
              Password set! You can now sign in with your email and password.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-primary-50/50 border-primary-200 mb-6 rounded-xl border p-5">
        <h3 className="text-secondary-900 mb-1 text-sm font-medium">
          Set a password for faster sign-in
        </h3>
        <p className="text-secondary-500 mb-4 text-xs">
          Optional — you can always use email links instead.
        </p>
        <form onSubmit={handleSetPassword} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            autoComplete="new-password"
            className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
          />
          {pwState === "error" && (
            <p className="text-xs font-medium text-red-600">{pwError}</p>
          )}
          <button
            type="submit"
            disabled={pwState === "submitting"}
            className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex items-center gap-2 rounded-full px-6 py-2.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pwState === "submitting" ? (
              <>
                <Spinner /> Setting…
              </>
            ) : (
              "Set Password"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (showLogout) {
    return (
      <div className="border-secondary-100 border-t pt-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-secondary-400 flex items-center gap-2 text-sm transition-colors hover:text-red-500 disabled:opacity-50"
        >
          {loggingOut ? (
            <>
              <Spinner /> Signing out…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
}
