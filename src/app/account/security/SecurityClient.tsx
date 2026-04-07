"use client";

import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";
import type { Customer } from "~/types/auth";

type FormState = "idle" | "submitting" | "success" | "error";

interface SecurityClientProps {
  customer: Customer;
}

export default function SecurityClient({
  customer: initialCustomer,
}: SecurityClientProps) {
  const { customer, refreshUser } = useAuth();
  const hasPassword = customer?.hasPassword ?? initialCustomer.hasPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors = new Set<string>();
    if (newPassword.length < 8) errors.add("newPassword");
    if (newPassword !== confirmPassword) errors.add("confirmPassword");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setFormState("error");
      setErrorMessage(
        errors.has("newPassword")
          ? "Password must be at least 8 characters."
          : "Passwords do not match.",
      );
      return;
    }
    setFieldErrors(new Set());

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          data.error ?? "Failed to set password. Please try again.",
        );
      }

      setFormState("success");
      setNewPassword("");
      setConfirmPassword("");
      await refreshUser();
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to set password. Please try again.",
      );
    }
  };

  if (formState === "success") {
    return (
      <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-5 w-5 text-green-500"
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
          <div>
            <p className="text-secondary-900 text-sm font-medium">
              Password {hasPassword ? "updated" : "set"} successfully
            </p>
            <p className="text-secondary-400 mt-0.5 text-xs">
              You can now sign in with your new password.
            </p>
          </div>
        </div>
        <button
          onClick={() => setFormState("idle")}
          className="text-primary-500 hover:text-primary-400 mt-6 text-sm font-medium transition-colors"
        >
          {hasPassword ? "Change password again" : "Update password"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
      <h2 className="text-secondary-400 mb-1 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
        Password
      </h2>
      <p className="font-display text-secondary-900 mb-6 text-lg font-semibold">
        {hasPassword ? "Change password" : "Set a password"}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.size)
                setFieldErrors((prev) => {
                  const n = new Set(prev);
                  n.delete("newPassword");
                  return n;
                });
            }}
            autoComplete="new-password"
            placeholder="••••••••"
            className={`w-full border ${fieldErrors.has("newPassword") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.size)
                setFieldErrors((prev) => {
                  const n = new Set(prev);
                  n.delete("confirmPassword");
                  return n;
                });
            }}
            autoComplete="new-password"
            placeholder="••••••••"
            className={`w-full border ${fieldErrors.has("confirmPassword") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
          />
        </div>

        {formState === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
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
              Saving…
            </>
          ) : hasPassword ? (
            "Update Password"
          ) : (
            "Set Password"
          )}
        </button>
      </form>
    </div>
  );
}
