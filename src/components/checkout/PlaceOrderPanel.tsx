"use client";

import { useState } from "react";
import { Spinner } from "~/components/ui/Spinner";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  image?: string | null;
  quantity: number;
  price: number;
}

interface PlaceOrderPanelProps {
  items: CartItem[];
  email: string;
  phone?: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  onSuccess: (data: { orderId: number; orderNumber: string | null }) => void;
  onError: (message: string) => void;
}

export default function PlaceOrderPanel({
  items,
  email,
  phone,
  shippingAddress,
  onSuccess,
  onError,
}: PlaceOrderPanelProps) {
  const [sendEmail, setSendEmail] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (
      !shippingAddress.name ||
      !email ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      onError("Please fill in all shipping fields before placing your order.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/dev-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: email,
          ...(phone ? { phoneNumber: phone } : {}),
          items: items.map((item) => ({
            variationId: item.id,
            productId: item.productId,
            name: item.name,
            variation: item.variation || null,
            manufacturerNo: item.manufacturerNo || null,
            imageUrl: item.image || null,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            name: shippingAddress.name,
            line1: shippingAddress.line1,
            ...(shippingAddress.line2 ? { line2: shippingAddress.line2 } : {}),
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || "US",
          },
          sendEmail,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to create order");
      }

      const data = (await response.json()) as {
        orderId: number;
        orderNumber?: string | null;
      };

      onSuccess({
        orderId: data.orderId,
        orderNumber: data.orderNumber ?? null,
      });
    } catch (err) {
      console.error("[PlaceOrder] Error:", err);
      onError(err instanceof Error ? err.message : "Failed to create order");
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
          className="border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
        />
        <span className="text-secondary-600 text-sm">
          Send order confirmation email
        </span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="bg-secondary-900 hover:bg-secondary-800 flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isPending && <Spinner />}
        {isPending ? "Processing Order..." : "Place Order"}
      </button>

      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="border-secondary-200 text-secondary-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.6rem] font-medium tracking-[0.15em] uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Test Mode
        </span>
      </div>
    </div>
  );
}
