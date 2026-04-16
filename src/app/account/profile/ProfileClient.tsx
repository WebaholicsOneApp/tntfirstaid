"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/Spinner";
import { formatPhone } from "~/lib/utils";
import type { Customer } from "~/types/auth";
import { US_STATES } from "~/lib/us-states";

type FormState = "idle" | "submitting" | "success" | "error";

interface ProfileClientProps {
  customer: Customer;
}

export default function ProfileClient({
  customer: initialCustomer,
}: ProfileClientProps) {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(initialCustomer.firstName || "");
  const [lastName, setLastName] = useState(initialCustomer.lastName || "");
  const [phone, setPhone] = useState(() =>
    formatPhone(initialCustomer.phone || ""),
  );

  const [line1, setLine1] = useState(
    initialCustomer.defaultAddress?.line1 || "",
  );
  const [line2, setLine2] = useState(
    initialCustomer.defaultAddress?.line2 || "",
  );
  const [city, setCity] = useState(initialCustomer.defaultAddress?.city || "");
  const [state, setState] = useState(
    initialCustomer.defaultAddress?.state || "",
  );
  const [postalCode, setPostalCode] = useState(
    initialCustomer.defaultAddress?.postalCode || "",
  );

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [zipLookupStatus, setZipLookupStatus] = useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");
  const zipAbortRef = useRef<AbortController | null>(null);

  const lookupZip = useCallback(async (zip: string) => {
    // Cancel any in-flight lookup
    zipAbortRef.current?.abort();

    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setZipLookupStatus("idle");
      return;
    }

    setZipLookupStatus("loading");
    const controller = new AbortController();
    zipAbortRef.current = controller;

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        setZipLookupStatus("not-found");
        return;
      }
      const data = (await res.json()) as {
        places?: Array<{ "place name": string; "state abbreviation": string }>;
      };
      const place = data.places?.[0];
      if (place) {
        setCity(place["place name"]);
        setState(place["state abbreviation"]);
        setZipLookupStatus("found");
      } else {
        setZipLookupStatus("not-found");
      }
    } catch {
      if (!controller.signal.aborted) {
        setZipLookupStatus("idle");
      }
    }
  }, []);

  const handleZipChange = (value: string) => {
    // Only allow digits, max 5
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    setPostalCode(cleaned);
    if (cleaned.length === 5) {
      lookupZip(cleaned);
    } else {
      setZipLookupStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors = new Set<string>();
    if (!firstName.trim()) errors.add("firstName");
    if (!lastName.trim()) errors.add("lastName");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setFormState("error");
      setErrorMessage("First and last name are required.");
      return;
    }
    setFieldErrors(new Set());

    setFormState("submitting");
    setErrorMessage("");

    try {
      const payload: Record<string, unknown> = { firstName, lastName, phone };
      if (line1.trim()) {
        payload.defaultAddress = { line1, line2, city, state, postalCode };
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          data.error ?? "Failed to update profile. Please try again.",
        );
      }

      setFormState("success");
      await refreshUser();
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.",
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
              Profile updated successfully
            </p>
            <p className="text-secondary-400 mt-0.5 text-xs">
              Your changes have been saved.
            </p>
          </div>
        </div>
        <button
          onClick={() => setFormState("idle")}
          className="text-primary-500 hover:text-primary-400 mt-6 text-sm font-medium transition-colors"
        >
          Edit profile again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Card 1 — Personal Information */}
      <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
        <h2 className="text-secondary-400 mb-1 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Personal Information
        </h2>
        <p className="font-display text-secondary-900 mb-6 text-lg font-semibold">
          Your details
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="first-name"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.size)
                    setFieldErrors((prev) => {
                      const n = new Set(prev);
                      n.delete("firstName");
                      return n;
                    });
                }}
                autoComplete="given-name"
                placeholder="John"
                className={`w-full border ${fieldErrors.has("firstName") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="last-name"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.size)
                    setFieldErrors((prev) => {
                      const n = new Set(prev);
                      n.delete("lastName");
                      return n;
                    });
                }}
                autoComplete="family-name"
                placeholder="Doe"
                className={`w-full border ${fieldErrors.has("lastName") ? "border-red-400" : "border-secondary-200"} text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 rounded-lg bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Card 2 — Default Shipping Address */}
      <div className="border-secondary-100 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
        <h2 className="text-secondary-400 mb-1 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Shipping Address
        </h2>
        <p className="font-display text-secondary-900 mb-6 text-lg font-semibold">
          Used to pre-fill checkout
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="address-line1"
              className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
            >
              Address Line 1
            </label>
            <input
              id="address-line1"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              autoComplete="address-line1"
              placeholder="123 Main St"
              className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address-line2"
              className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
            >
              Line 2 (Optional)
            </label>
            <input
              id="address-line2"
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              autoComplete="address-line2"
              placeholder="Apt, Suite, Unit"
              className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
            />
          </div>

          {/* ZIP first — triggers city/state auto-fill */}
          <div className="space-y-2">
            <label
              htmlFor="postal-code"
              className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
            >
              ZIP Code
            </label>
            <div className="relative">
              <input
                id="postal-code"
                type="text"
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => handleZipChange(e.target.value)}
                autoComplete="postal-code"
                placeholder="10001"
                maxLength={5}
                className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              {zipLookupStatus === "loading" && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Spinner className="text-secondary-300 h-4 w-4" />
                </div>
              )}
              {zipLookupStatus === "found" && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-green-500"
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
              )}
            </div>
            {zipLookupStatus === "found" && city && state && (
              <p className="mt-1 text-xs text-green-600">
                Found: {city}, {state}
              </p>
            )}
            {zipLookupStatus === "not-found" && (
              <p className="mt-1 text-xs text-amber-600">
                ZIP code not recognized. Please enter city and state manually.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="city"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                placeholder="New York"
                className="border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="state"
                className="text-secondary-400 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              >
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
                className="border-secondary-200 text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 w-full appearance-none rounded-lg border bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.abbr} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {formState === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={formState === "submitting"}
        className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex w-full items-center justify-center gap-2 rounded-full py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {formState === "submitting" ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
