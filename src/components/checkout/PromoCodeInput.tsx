"use client";

import { useState, useCallback } from "react";
import type { CartItem } from "~/types/cart";
import { formatCentsToDollars } from "~/lib/utils";

// The discount value the parent (OrderSummary) holds and the backend round-trip
// produces. Mirrors the oneapp apply-discount response in the valid branch.
export interface AppliedDiscount {
  code: string;
  discountCents: number;
  discountType: "p" | "f";
  discountAmount: number;
}

interface PromoCodeInputProps {
  cartItems: Array<CartItem | { id: number; quantity: number }>;
  applied?: AppliedDiscount | null;
  onChange: (next: AppliedDiscount | null) => void;
}

/**
 * Build a context-rich error message from the apply-discount rejection
 * payload. Uses the `details` bag returned by the oneapp validator so the
 * shopper sees the real minimum, expiry date, or redemption cap instead of
 * a generic "not valid" line.
 */
function buildRejectionMessage(data: {
  reason?: string;
  details?: {
    expiresAt?: string;
    maxUses?: number;
    minOrderCents?: number;
    subtotalCents?: number;
  };
}): string {
  const d = data?.details ?? {};
  switch (data?.reason) {
    case "not_found":
      return "We couldn't find that code. Double-check the spelling.";
    case "inactive":
      return "That code isn't active right now.";
    case "expired": {
      if (d.expiresAt) {
        const when = new Date(d.expiresAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return `That code expired on ${when}.`;
      }
      return "That code has expired.";
    }
    case "exhausted":
      return typeof d.maxUses === "number"
        ? `That code has reached its redemption limit (${d.maxUses} uses).`
        : "That code has reached its redemption limit.";
    case "min_order": {
      const min =
        typeof d.minOrderCents === "number"
          ? formatCentsToDollars(d.minOrderCents)
          : null;
      const sub = typeof d.subtotalCents === "number" ? d.subtotalCents : null;
      if (
        min &&
        sub != null &&
        typeof d.minOrderCents === "number" &&
        d.minOrderCents > sub
      ) {
        const short = formatCentsToDollars(d.minOrderCents - sub);
        return `This code requires a ${min} minimum — add ${short} more to qualify.`;
      }
      return min
        ? `This code requires a ${min} minimum.`
        : "Your cart doesn't meet the minimum for that code.";
    }
    default:
      return "That code isn't valid.";
  }
}

export default function PromoCodeInput({
  cartItems,
  applied,
  onChange,
}: PromoCodeInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(async () => {
    const code = value.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/apply-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: cartItems.map((i: any) => ({
            variationId: i.variationId ?? i.id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Couldn't apply code.");
        return;
      }
      if (data?.valid === false) {
        setError(buildRejectionMessage(data));
        return;
      }
      if (data?.valid === true && typeof data.discountCents === "number") {
        onChange({
          code,
          discountCents: data.discountCents,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
        });
        setValue("");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [value, cartItems, onChange]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setError(null);
    setValue("");
  }, [onChange]);

  // ── Applied state: show the applied code as a chip with a "Remove" button ──
  if (applied) {
    return (
      <div className="border-secondary-100 rounded-xl border bg-green-50/50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Promo applied
            </div>
            <div className="text-secondary-900 truncate font-mono text-sm font-semibold">
              {applied.code}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-secondary-500 hover:text-secondary-900 text-[0.7rem] font-medium underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state: input + apply button ──
  return (
    <div>
      <label
        htmlFor="promo-code-input"
        className="text-secondary-400 mb-2 block font-mono text-[0.6rem] tracking-[0.3em] uppercase"
      >
        Promo code
      </label>
      <div className="flex gap-2">
        <input
          id="promo-code-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="ENTER CODE"
          maxLength={32}
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
          className="border-secondary-100 focus:border-primary-500 focus:ring-primary-500/20 placeholder:text-secondary-300 flex-1 rounded-lg border bg-white px-3 py-2 font-mono text-sm tracking-wider uppercase focus:ring-2 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || value.trim().length < 3}
          className="bg-secondary-900 hover:bg-secondary-800 rounded-lg px-4 py-2 text-[0.7rem] font-semibold tracking-wider text-white uppercase disabled:opacity-40"
        >
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
