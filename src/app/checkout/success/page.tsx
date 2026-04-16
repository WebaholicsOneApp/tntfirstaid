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
// Eyebrow label — matches site-wide style
// ---------------------------------------------------------------------------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="bg-primary-500 h-px w-6" />
      <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
        {children}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order Details Card (items + totals + shipping address, unified)
// ---------------------------------------------------------------------------

function OrderDetailsCard({ orderInfo }: { orderInfo: OrderInfo }) {
  const items = orderInfo.items;
  if (!items || items.length === 0) return null;

  const shipping = orderInfo.shipping;

  return (
    <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
      <Eyebrow>Order Details</Eyebrow>

      {/* Items */}
      <ul className="divide-secondary-100 divide-y">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-4 py-4 first:pt-0">
            <div className="bg-secondary-50 flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-black/[0.04]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
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
                <p className="text-secondary-500 mt-1 text-xs">
                  {item.variationName}
                  {item.variationName && item.sku && " · "}
                  {item.sku}
                </p>
              )}
              <p className="text-secondary-500 mt-0.5 text-xs">
                Qty {item.quantity}
              </p>
            </div>
            <div className="text-secondary-900 flex-shrink-0 text-sm font-semibold tabular-nums">
              {formatCents(item.price * item.quantity)}
            </div>
          </li>
        ))}
      </ul>

      {/* Downloads (if any) */}
      {items.some((item) => item.downloadUrl) && (
        <div className="border-secondary-100 mt-5 border-t pt-5">
          <Eyebrow>Your Downloads</Eyebrow>
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
                  className="group flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 transition-colors hover:border-sky-300 hover:bg-sky-50"
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
                    <p className="text-secondary-500 text-xs">PDF Download</p>
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

      {/* Totals */}
      {orderInfo.subtotal != null && (
        <div className="border-secondary-100 mt-5 space-y-2 border-t pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-500">Subtotal</span>
            <span className="text-secondary-900 tabular-nums">
              {formatCents(orderInfo.subtotal)}
            </span>
          </div>
          {orderInfo.discountCents != null && orderInfo.discountCents > 0 && (
            <div className="flex justify-between">
              <span className="text-secondary-500">
                Discount{" "}
                {orderInfo.discountCode && (
                  <span className="text-secondary-400">
                    ({orderInfo.discountCode})
                  </span>
                )}
              </span>
              <span className="tabular-nums text-green-600">
                −{formatCents(orderInfo.discountCents)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <div>
              <span className="text-secondary-500">Shipping</span>
              {orderInfo.shippingServiceName && (
                <p className="text-secondary-400 text-xs">
                  {orderInfo.shippingServiceName}
                </p>
              )}
            </div>
            {orderInfo.shippingCost === 0 ? (
              <span className="font-semibold text-green-600">FREE</span>
            ) : (
              <span className="text-secondary-900 tabular-nums">
                {formatCents(orderInfo.shippingCost || 0)}
              </span>
            )}
          </div>
          {(orderInfo.tax ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-secondary-500">Tax</span>
              <span className="text-secondary-900 tabular-nums">
                {formatCents(orderInfo.tax || 0)}
              </span>
            </div>
          )}
          <div className="border-secondary-100 mt-2 flex items-baseline justify-between border-t pt-3">
            <span className="text-secondary-700 text-sm font-semibold uppercase">
              Total
            </span>
            <span className="font-display text-secondary-900 text-2xl font-bold tabular-nums">
              {formatCents(orderInfo.total || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Shipping address (read-only) */}
      {shipping?.line1 && (
        <div className="border-secondary-100 mt-6 border-t pt-6">
          <Eyebrow>Shipping To</Eyebrow>
          <div className="text-secondary-700 text-sm leading-relaxed">
            <p className="text-secondary-900 font-semibold">{shipping.name}</p>
            <p>{shipping.line1}</p>
            {shipping.line2 && <p>{shipping.line2}</p>}
            <p>
              {shipping.city}, {shipping.state} {shipping.postalCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "What happens next" progression
// ---------------------------------------------------------------------------

function WhatsNextCard({ customerEmail }: { customerEmail: string | null }) {
  const steps = [
    {
      done: true,
      title: "Confirmation sent",
      desc: customerEmail
        ? `A receipt is on its way to ${customerEmail}`
        : "A receipt has been emailed to you",
    },
    {
      done: false,
      title: "Packing & shipping",
      desc: "We'll pack your kit and hand it to UPS within 1–2 business days",
    },
    {
      done: false,
      title: "Tracking number",
      desc: "You'll get an email with a tracking link the moment it ships",
    },
  ];

  return (
    <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
      <Eyebrow>What Happens Next</Eyebrow>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <div
              className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done
                  ? "bg-green-100 text-green-700"
                  : "bg-secondary-100 text-secondary-500"
              }`}
              aria-hidden
            >
              {step.done ? (
                <svg
                  className="h-3.5 w-3.5"
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
              ) : (
                i + 1
              )}
            </div>
            <div>
              <p className="text-secondary-900 text-sm font-semibold">
                {step.title}
              </p>
              <p className="text-secondary-500 mt-0.5 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
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

  // Auth card wrapper — lighter visual weight than before (same ring+shadow
  // as OrderDetailsCard so it doesn't visually compete with the hero).
  const renderCard = (children: React.ReactNode) => (
    <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
      <Eyebrow>Track Your Order</Eyebrow>
      {children}
      <div className="border-secondary-100 mt-6 border-t pt-5 text-center">
        <p className="text-secondary-500 text-sm">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-primary-600/30 underline-offset-4 transition-colors hover:decoration-primary-600"
          >
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );

  // Auth disabled — just show help
  if (!customerAuthEnabled) {
    return renderCard(
      <div>
        <p className="text-secondary-900 mb-2 text-base font-semibold">
          Order placed successfully
        </p>
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
        <p className="text-secondary-900 mb-2 text-base font-semibold">
          You&apos;re all set
        </p>
        <p className="text-secondary-500 mb-5 text-sm leading-relaxed">
          Your order is linked to your account. Track shipments and view history
          anytime.
        </p>

        <div className="mb-5 flex items-center gap-2.5">
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
          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-sm font-semibold underline decoration-primary-600/30 underline-offset-4 transition-colors hover:decoration-primary-600"
        >
          View your orders
          <span aria-hidden>→</span>
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
    "border-secondary-200 text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none";

  return renderCard(
    <div>
      <p className="text-secondary-900 mb-1.5 text-base font-semibold">
        Create an account (optional)
      </p>
      <p className="text-secondary-500 mb-5 text-sm leading-relaxed">
        Sign in to track shipments and speed up future purchases.
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
          <div
            className="border-secondary-200 mb-5 flex overflow-hidden rounded-lg border"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "magic"}
              onClick={() => switchTab("magic")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "magic"
                  ? "bg-secondary-900 text-white"
                  : "bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "password"}
              onClick={() => switchTab("password")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "password"
                  ? "bg-secondary-900 text-white"
                  : "bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700"
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
                className="bg-primary-500 hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formState === "submitting" ? <Spinner /> : "Send Sign-In Link"}
              </button>
              <p className="text-secondary-500 mt-1 text-center text-xs leading-relaxed">
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
                className="bg-secondary-900 hover:bg-secondary-800 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formState === "submitting" ? <Spinner /> : "Sign In"}
              </button>
              <div className="mt-1 flex items-center justify-between text-xs">
                <Link
                  href="/account/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
                <p className="text-secondary-500">
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("magic")}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
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

// Dev-only: visit /checkout/success?mock=1 to preview the page with
// plausible fake data. Gated on NODE_ENV so it cannot fire in production.
const MOCK_ORDER: OrderInfo = {
  orderId: 9001,
  orderNumber: "TNT-2026-9001",
  customerEmail: "preview@tntfirstaid.example",
  status: "paid",
  createdAt: new Date().toISOString(),
  shipping: {
    name: "Jane Smith",
    line1: "123 Main St",
    line2: "Suite 4B",
    city: "Salt Lake City",
    state: "UT",
    postalCode: "84101",
    country: "US",
  },
  items: [
    {
      name: "Loggers First Aid Kit",
      variationName: null,
      sku: "LOG-001",
      imageUrl: null,
      quantity: 1,
      price: 4999,
    },
    {
      name: "STOP The Bleed Kit",
      variationName: null,
      sku: "STB-001",
      imageUrl: null,
      quantity: 2,
      price: 6800,
    },
  ],
  subtotal: 18599,
  shippingCost: 1295,
  shippingServiceName: "UPS Ground",
  tax: 875,
  total: 20769,
  discountCents: 1000,
  discountCode: "WELCOME10",
};

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const orderNumberParam = searchParams.get("order_number");
  const mockMode =
    process.env.NODE_ENV !== "production" &&
    searchParams.get("mock") === "1";
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(
    mockMode ? MOCK_ORDER : null,
  );
  const [loading, setLoading] = useState(!mockMode);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);

  useEffect(() => {
    if (mockMode) return;
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
  }, [clearCart, sessionId, orderId, orderNumberParam, mockMode]);

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
    <div className="bg-secondary-50 min-h-[100dvh] px-4 py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        {/* ── HERO BAND ── the success moment gets its own space */}
        <div className="animate-fade-in mb-10 text-center sm:mb-14">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-display text-secondary-900 text-4xl font-bold tracking-tight sm:text-5xl">
            Order Confirmed
          </h1>

          {loading ? (
            <p className="text-secondary-500 mt-4 text-sm">
              Loading your order details…
            </p>
          ) : (
            <>
              {orderInfo?.orderNumber && (
                <p className="text-secondary-600 mt-4 text-base">
                  Order number{" "}
                  <span className="text-secondary-900 font-semibold tabular-nums">
                    #{orderInfo.orderNumber}
                  </span>
                </p>
              )}
              {orderInfo?.customerEmail && (
                <p className="text-secondary-500 mt-2 text-sm">
                  A receipt has been sent to{" "}
                  <span className="text-secondary-700 font-medium">
                    {orderInfo.customerEmail}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ── TWO-COLUMN SUPPORTING CONTENT ── */}
            <div
              className={`grid items-start gap-6 ${
                hasOrderDetails
                  ? "lg:grid-cols-[1.6fr_1fr] lg:gap-8"
                  : "mx-auto max-w-md"
              }`}
            >
              <div className="space-y-6">
                {hasOrderDetails && <OrderDetailsCard orderInfo={orderInfo!} />}
                <WhatsNextCard
                  customerEmail={orderInfo?.customerEmail || null}
                />
              </div>

              <div className="lg:sticky lg:top-8">
                <AuthPanel customerEmail={orderInfo?.customerEmail || null} />
              </div>
            </div>

            {/* ── BOTTOM CTA — single primary + text link ── */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-14 sm:flex-row sm:gap-6">
              <Link
                href="/shop"
                className="group bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white uppercase shadow-[0_8px_30px_rgba(227,24,55,0.25)] transition-colors active:scale-[0.98]"
              >
                Continue Shopping
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                href="/"
                className="text-secondary-600 hover:text-secondary-900 text-sm font-medium transition-colors"
              >
                Back to home
              </Link>
            </div>

            {/* ── RECOMMENDATIONS ── */}
            {inStockRecommendations.length > 0 && (
              <div className="mt-16 sm:mt-20">
                <div className="mb-6 text-center">
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <div className="bg-primary-500 h-px w-6" />
                    <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                      Recommended
                    </span>
                    <div className="bg-primary-500 h-px w-6" />
                  </div>
                  <h2 className="font-display text-secondary-900 text-2xl font-bold tracking-tight sm:text-3xl">
                    Customers Also Bought
                  </h2>
                </div>
                <RecommendationGrid
                  products={inStockRecommendations.slice(0, 4)}
                />
              </div>
            )}
          </>
        )}
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
