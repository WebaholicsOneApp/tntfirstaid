"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "~/lib/cart/CartContext";
import RecommendationGrid from "~/components/products/RecommendationGrid";
import type { ProductListItem } from "~/types";

interface OrderInfo {
  orderId: number | string;
  orderNumber: string | null;
  customerEmail: string | null;
}

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const orderNumberParam = searchParams.get("order_number");
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);

  useEffect(() => {
    // Save product IDs for recommendations before clearing cart
    try {
      const cartStr = localStorage.getItem("alpha-munitions-cart");
      if (cartStr) {
        const parsed = JSON.parse(cartStr);
        const ids = (parsed?.items || [])
          .map((i: { productId?: number }) => i.productId)
          .filter(Boolean);
        if (ids.length > 0) {
          sessionStorage.setItem(
            "alpha-checkout-product-ids",
            JSON.stringify(ids),
          );
        }
      }
    } catch {
      /* ignore parse errors */
    }

    // Clear the cart on successful checkout
    clearCart();

    // Fetch order information from either session_id or order_id
    const fetchOrderInfo = async () => {
      try {
        if (orderId && orderNumberParam) {
          setOrderInfo({
            orderId,
            orderNumber: orderNumberParam,
            customerEmail: null,
          });
          return;
        }

        let response: Response | null = null;

        if (sessionId) {
          // Regular Stripe Checkout flow
          response = await fetch(`/api/orders/session/${sessionId}`);
        } else if (orderId) {
          // Express Checkout flow (Apple Pay / Google Pay)
          response = await fetch(`/api/orders/${orderId}`);
        }

        if (response?.ok) {
          const data = await response.json();
          setOrderInfo(data);
        }
      } catch (error) {
        console.error("Error fetching order info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [clearCart, sessionId, orderId, orderNumberParam]);

  // Fetch recommendations based on recently ordered products
  useEffect(() => {
    try {
      const savedIds = sessionStorage.getItem("alpha-checkout-product-ids");
      if (!savedIds) return;
      const productIds: number[] = JSON.parse(savedIds);
      if (productIds.length === 0) return;

      fetch(`/api/recommendations?productIds=${productIds.join(",")}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.recommendations?.length) {
            setRecommendations(data.recommendations);
          }
        })
        .catch(() => {});

      sessionStorage.removeItem("alpha-checkout-product-ids");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="bg-secondary-50 flex min-h-screen items-center justify-center p-4">
      <div className="border-secondary-100 w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-display text-secondary-900 mb-4 text-3xl font-bold">
          Order <span className="text-green-600">Confirmed!</span>
        </h1>

        {loading ? (
          <div className="py-8">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            <p className="text-secondary-400 mt-4 text-sm">
              Processing your order...
            </p>
          </div>
        ) : (
          <>
            {orderInfo?.orderNumber && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="mb-2 text-xs font-bold tracking-widest text-green-600 uppercase">
                  Order Number
                </p>
                <p className="text-secondary-900 text-2xl font-bold">
                  {orderInfo.orderNumber}
                </p>
              </div>
            )}

            <p className="text-secondary-600 mb-8 leading-relaxed">
              Thank you for your purchase! We&apos;ve sent a confirmation email
              with your order details.
            </p>
          </>
        )}

        {/* You May Also Like */}
        {recommendations.filter((r) => r.inStock).length > 0 && (
          <div className="mt-8 mb-6 text-left">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Recommended
              </span>
            </div>
            <h2 className="font-display text-secondary-900 mb-4 text-lg font-bold">
              Customers Also Bought
            </h2>
            <RecommendationGrid
              products={recommendations.filter((r) => r.inStock).slice(0, 5)}
            />
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/shop"
            className="bg-primary-500 text-secondary-950 hover:bg-primary-400 block w-full rounded-full py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 block w-full rounded-full border py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>

        <div className="border-secondary-100 mt-12 border-t pt-8">
          <p className="text-secondary-400 mb-4 text-xs font-bold tracking-widest uppercase">
            Need Help?
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-500 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-secondary-50 flex min-h-screen items-center justify-center">
          <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
