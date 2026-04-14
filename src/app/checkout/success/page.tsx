"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "~/lib/cart/CartContext";
import { useAuth } from "~/lib/auth";
import RecommendationGrid from "~/components/products/RecommendationGrid";
import { Spinner } from "~/components/ui/Spinner";
import { getDownloadUrlByName } from "~/lib/downloads";
import { DISCOUNT_SESSION_KEY } from "~/components/checkout/CheckoutTypes";
import type { ProductListItem } from "~/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  name: string;
  variationName: string | null;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  price: number; // cents
  isDownloadable?: boolean;
  downloadUrl?: string | null;
}

interface OrderInfo {
  orderId: number | string;
  orderNumber: string | null;
  customerEmail: string | null;
  status?: string;
  createdAt?: string;
  shipping?: {
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items?: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  shippingServiceName?: string | null;
  tax?: number;
  total?: number;
  discountCents?: number;
  discountCode?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Order Summary
// ---------------------------------------------------------------------------

function OrderSummary({ orderInfo }: { orderInfo: OrderInfo }) {
  const items = orderInfo.items;
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-primary-500 h-px w-6" />
        <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Order Summary
        </span>
      </div>

      <div className="divide-secondary-100 divide-y">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="animate-fade-in flex items-center gap-3.5 py-3.5"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="bg-secondary-100 flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="text-secondary-300 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-secondary-900 text-sm leading-tight font-semibold">
                {item.name}
              </p>
              {(item.variationName || item.sku) && (
                <p className="text-secondary-400 mt-0.5 font-mono text-[0.65rem] tracking-wide">
                  {item.variationName}
                  {item.variationName && item.sku && " \u00b7 "}
                  {item.sku}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="text-secondary-400 font-mono text-[0.65rem]">
                x{item.quantity}
              </p>
              <p className="text-secondary-900 text-sm font-semibold">
                {formatCents(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Downloads section */}
      {items.some((item) => item.downloadUrl) && (
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Your Downloads
            </span>
          </div>
          <div className="space-y-2">
            {items
              .filter((item) => item.downloadUrl)
              .map((item, idx) => (
                <a
                  key={idx}
                  href={item.downloadUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="group flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 transition-all hover:border-sky-300 hover:bg-sky-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                    <svg
                      className="h-5 w-5 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary-900 text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-secondary-400 font-mono text-[0.6rem] tracking-wide">
                      PDF Download
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-sky-500 transition-transform group-hover:translate-y-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              ))}
          </div>
        </div>
      )}

      {orderInfo.subtotal != null && (
        <div className="border-secondary-200 mt-3 space-y-1.5 border-t pt-3">
          <div className="text-secondary-500 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCents(orderInfo.subtotal)}</span>
          </div>
          {orderInfo.discountCents != null && orderInfo.discountCents > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                Discount
                {orderInfo.discountCode ? ` (${orderInfo.discountCode})` : ""}
              </span>
              <span>−{formatCents(orderInfo.discountCents)}</span>
            </div>
          )}
          <div className="text-secondary-500 flex justify-between text-sm">
            <div>
              <span>Shipping</span>
              {orderInfo.shippingServiceName && (
                <p className="text-secondary-400 text-xs">
                  {orderInfo.shippingServiceName}
                </p>
              )}
            </div>
            <span
              className={orderInfo.shippingCost === 0 ? "text-green-600" : ""}
            >
              {orderInfo.shippingCost === 0
                ? "Free"
                : formatCents(orderInfo.shippingCost || 0)}
            </span>
          </div>
          {(orderInfo.tax ?? 0) > 0 && (
            <div className="text-secondary-500 flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCents(orderInfo.tax || 0)}</span>
            </div>
          )}
          <div className="text-secondary-900 border-secondary-900/10 flex justify-between border-t-2 pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatCents(orderInfo.total || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shipping Address
// ---------------------------------------------------------------------------

function ShippingAddress({ shipping }: { shipping: OrderInfo["shipping"] }) {
  if (!shipping) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-primary-500 h-px w-6" />
        <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Shipping To
        </span>
      </div>
      <div className="text-secondary-600 text-sm leading-relaxed">
        <p className="text-secondary-900 font-semibold">{shipping.name}</p>
        <p>{shipping.line1}</p>
        {shipping.line2 && <p>{shipping.line2}</p>}
        <p>
          {shipping.city}, {shipping.state} {shipping.postalCode}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auth Panel (Right Column)
// ---------------------------------------------------------------------------

type AuthTab = "magic" | "password";
type FormState = "idle" | "submitting" | "success" | "error";

function AuthPanel({ customerEmail }: { customerEmail: string | null }) {
  const { isAuthenticated, customerAuthEnabled, customer, refreshUser } =
    useAuth();
  const [tab, setTab] = useState<AuthTab>("magic");
  const [email, setEmail] = useState(customerEmail || "");
  const [password, setPassword] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleFocus = () => refreshUser();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshUser]);

  // Auth card wrapper
  const renderCard = (children: React.ReactNode) => (
    <div className="border-secondary-100 animate-fade-in rounded-3xl border bg-white p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary-500 h-px w-6" />
        <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
          Track Your Order
        </span>
      </div>

      {children}

      {/* Help footer */}
      <div className="border-secondary-100 mt-8 border-t pt-6 text-center">
        <p className="text-secondary-300 mb-2 font-mono text-[0.55rem] tracking-[0.2em] uppercase">
          Need Help?
        </p>
        <Link
          href="/contact"
          className="text-primary-500 hover:text-primary-400 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );

  // Auth disabled — just show help
  if (!customerAuthEnabled) {
    return renderCard(
      <div>
        <h2 className="font-display text-secondary-900 mb-2 text-2xl font-bold tracking-tight">
          Order placed successfully
        </h2>
        <p className="text-secondary-500 text-sm leading-relaxed">
          You&apos;ll receive a confirmation email with tracking updates as your
          order ships.
        </p>
      </div>,
    );
  }

  // Authenticated
  if (isAuthenticated && customer) {
    return renderCard(
      <div>
        <h2 className="font-display text-secondary-900 mb-2 text-2xl font-bold tracking-tight">
          You&apos;re all set
        </h2>
        <p className="text-secondary-500 mb-6 text-sm leading-relaxed">
          Your order is linked to your account. Track shipments and view history
          anytime.
        </p>

        <div className="mb-4 flex items-center gap-2.5">
          <svg
            className="h-[18px] w-[18px] flex-shrink-0 text-green-600"
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
          <p className="text-secondary-900 text-sm font-medium">
            Signed in as {customer.email}
          </p>
        </div>

        <Link
          href="/account/orders"
          className="text-primary-500 hover:text-primary-400 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
        >
          View Your Orders &rarr;
        </Link>
      </div>,
    );
  }

  // ── Guest — tabbed Magic Link / Password ──

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setFormState("submitting");
    setErrorMessage("");
    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setFormState("success");
    } catch {
      setFormState("success"); // prevent email enumeration
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setFormState("error");
      setErrorMessage("Please enter your email and password.");
      return;
    }
    setFormState("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Invalid email or password.");
      }
      // Refresh auth context so authenticated state renders
      refreshUser();
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setFormState("idle");
    setErrorMessage("");
  };

  const inputClasses =
    "border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-[10px] border bg-white px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none";

  return renderCard(
    <div>
      <h2 className="font-display text-secondary-900 mb-2 text-2xl font-bold tracking-tight">
        Stay updated on your order
      </h2>
      <p className="text-secondary-500 mb-6 text-sm leading-relaxed">
        Create an account or sign in to view order status, track shipments, and
        speed up future purchases.
      </p>

      {formState === "success" && tab === "magic" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-2.5">
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
              <p className="mt-1 text-xs leading-relaxed text-green-600">
                If an account exists for{" "}
                <span className="font-medium">{email}</span>, we&apos;ve sent a
                sign-in link. It expires in 15 minutes.
              </p>
              <button
                onClick={() => {
                  setFormState("idle");
                  setEmail(customerEmail || "");
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
          {/* Tab switcher */}
          <div className="border-secondary-200 mb-5 flex overflow-hidden rounded-[10px] border">
            <button
              type="button"
              onClick={() => switchTab("magic")}
              className={`flex-1 py-2.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase transition-colors ${
                tab === "magic"
                  ? "bg-secondary-900 text-primary-500"
                  : "bg-secondary-50 text-secondary-400 hover:text-secondary-600"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => switchTab("password")}
              className={`flex-1 py-2.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase transition-colors ${
                tab === "password"
                  ? "bg-secondary-900 text-primary-500"
                  : "bg-secondary-50 text-secondary-400 hover:text-secondary-600"
              }`}
            >
              Password
            </button>
          </div>

          {/* Error message */}
          {formState === "error" && errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Magic Link panel */}
          {tab === "magic" && (
            <form
              onSubmit={handleMagicLink}
              noValidate
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClasses}
              />
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="bg-primary-500 text-secondary-950 hover:bg-primary-400 flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3.5 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formState === "submitting" ? <Spinner /> : "Send Sign-In Link"}
              </button>
              <p className="text-secondary-400 mt-1 text-center text-[0.7rem] leading-relaxed">
                We&apos;ll email you a secure link. Click it to sign in — no
                password needed.
              </p>
            </form>
          )}

          {/* Password panel */}
          {tab === "password" && (
            <form
              onSubmit={handlePasswordLogin}
              noValidate
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClasses}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Password"
                className={inputClasses}
              />
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="bg-secondary-900 text-primary-500 hover:bg-secondary-800 flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3.5 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formState === "submitting" ? <Spinner /> : "Sign In"}
              </button>
              <div className="mt-1 flex items-center justify-between text-[0.7rem]">
                <Link
                  href="/account/forgot-password"
                  className="text-primary-500 hover:text-primary-400 transition-colors"
                >
                  Forgot password?
                </Link>
                <p className="text-secondary-400">
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("magic")}
                    className="text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    Use Magic Link
                  </button>
                </p>
              </div>
            </form>
          )}
        </>
      )}
    </div>,
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

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
    clearCart();
    // Belt-and-braces: ensure the applied promo code does not carry over to
    // the next order, even if the path that landed us here bypassed
    // CheckoutConfirmClient's onSuccess cleanup.
    try {
      sessionStorage.removeItem(DISCOUNT_SESSION_KEY);
    } catch {}

    const fetchOrderInfo = async () => {
      try {
        let response: Response | null = null;

        if (orderId) {
          response = await fetch(`/api/orders/${orderId}`);
        } else if (sessionId) {
          response = await fetch(`/api/orders/session/${sessionId}`);
        }

        if (response?.ok) {
          const data = await response.json();
          // Inject fallback download URLs for known downloadable products
          if (data.items) {
            data.items = data.items.map((item: OrderItem) => ({
              ...item,
              downloadUrl:
                item.downloadUrl || getDownloadUrlByName(item.name) || null,
              isDownloadable:
                item.isDownloadable || !!getDownloadUrlByName(item.name),
            }));
          }
          setOrderInfo(data);
        } else if (orderId && orderNumberParam) {
          setOrderInfo({
            orderId,
            orderNumber: orderNumberParam,
            customerEmail: null,
          });
        }
      } catch (error) {
        console.error("Error fetching order info:", error);
        if (orderId && orderNumberParam) {
          setOrderInfo({
            orderId,
            orderNumber: orderNumberParam,
            customerEmail: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [clearCart, sessionId, orderId, orderNumberParam]);

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

  const hasOrderDetails = orderInfo?.items && orderInfo.items.length > 0;
  const inStockRecommendations = recommendations.filter((r) => r.inStock);

  return (
    <div className="bg-secondary-50 min-h-[100dvh] p-4 lg:p-12">
      <div className="mx-auto max-w-6xl">
        <div
          className={`grid items-start gap-8 ${
            hasOrderDetails
              ? "lg:grid-cols-[3fr_2fr] lg:gap-16"
              : "mx-auto max-w-md"
          }`}
        >
          {/* ── LEFT COLUMN ── */}
          <div className="animate-fade-in">
            {/* Checkmark + headline */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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

            <h1 className="font-display text-secondary-900 mb-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Order <span className="text-green-600">Confirmed!</span>
            </h1>

            {loading ? (
              <div className="py-12">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                <p className="text-secondary-400 mt-4 text-center text-sm">
                  Processing your order...
                </p>
              </div>
            ) : (
              <>
                {/* Order number badge */}
                {orderInfo?.orderNumber && (
                  <div className="mb-8 inline-flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3">
                    <span className="font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-green-600 uppercase">
                      Order
                    </span>
                    <span className="text-secondary-900 text-base font-bold">
                      {orderInfo.orderNumber}
                    </span>
                  </div>
                )}

                {/* Order details */}
                {hasOrderDetails && (
                  <>
                    <OrderSummary orderInfo={orderInfo!} />
                    {orderInfo!.shipping?.line1 && (
                      <ShippingAddress shipping={orderInfo!.shipping} />
                    )}
                  </>
                )}

                <p className="text-secondary-500 mb-8 text-sm leading-relaxed">
                  {orderInfo?.items?.some((i) => i.downloadUrl)
                    ? "Thank you for your purchase! Your download is ready above. We\u2019ve also sent a confirmation email with your download link."
                    : "Thank you for your purchase! We\u2019ve sent a confirmation email with your order details."}
                </p>

                {/* Action buttons */}
                <div className="mb-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="bg-primary-500 text-secondary-950 hover:bg-primary-400 rounded-full px-8 py-3 text-center font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-200 active:scale-[0.98]"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/"
                    className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 hover:text-primary-500 rounded-full border px-8 py-3 text-center font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-200"
                  >
                    Back to Home
                  </Link>
                </div>

                {/* Recommendations */}
                {inStockRecommendations.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                        Recommended
                      </span>
                    </div>
                    <h2 className="font-display text-secondary-900 mb-4 text-xl font-bold tracking-tight">
                      Customers Also Bought
                    </h2>
                    <RecommendationGrid
                      products={inStockRecommendations.slice(0, 4)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          {!loading && (
            <div className="lg:sticky lg:top-8">
              <AuthPanel customerEmail={orderInfo?.customerEmail || null} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-secondary-50 flex min-h-[100dvh] items-center justify-center">
          <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
