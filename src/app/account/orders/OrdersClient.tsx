"use client";

import { type JSX, useState } from "react";
import Link from "next/link";
import { ProductImage } from "~/components/ui/ProductImage";
import type { Order, OrdersResponse } from "~/types/auth";
import { getDownloadUrlByName } from "~/lib/downloads";
import { formatCentsToDollars } from "~/lib/utils";

// --- Status mapping: internal → customer-friendly ---
const STATUS_MAP: Record<string, { label: string; style: string }> = {
  UNASSIGNED: {
    label: "Received",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },
  PENDING: {
    label: "Pending",
    style: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PLACED: {
    label: "Confirmed",
    style: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PROCESSING: {
    label: "Processing",
    style: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  TRACKED: {
    label: "Shipped",
    style: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  COMPLETED: {
    label: "Delivered",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "ON-HOLD": {
    label: "On Hold",
    style: "bg-orange-50 text-orange-700 border-orange-200",
  },
  CANCELLED: {
    label: "Cancelled",
    style: "bg-red-50 text-red-600 border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    style: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ISSUE: { label: "Issue", style: "bg-rose-50 text-rose-700 border-rose-200" },
  FAILED: { label: "Failed", style: "bg-red-50 text-red-600 border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const mapped = STATUS_MAP[status.toUpperCase()] || {
    label: status,
    style: "bg-secondary-50 text-secondary-600 border-secondary-200",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.1em] uppercase ${mapped.style}`}
    >
      {mapped.label}
    </span>
  );
}

// --- Card brand SVG icons (16×16, monochrome) ---
function VisaIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <rect width="24" height="24" rx="3" fill="currentColor" opacity="0.08" />
      <path
        d="M9.5 15.5L11 8.5H13L11.5 15.5H9.5ZM16.5 8.7C16 8.5 15.3 8.3 14.4 8.3C12.4 8.3 11 9.3 11 10.7C11 11.8 12 12.3 12.7 12.7C13.5 13 13.7 13.3 13.7 13.6C13.7 14.1 13.1 14.3 12.5 14.3C11.7 14.3 11.3 14.2 10.6 13.9L10.3 13.8L10 15.4C10.5 15.6 11.4 15.8 12.4 15.8C14.5 15.8 15.8 14.8 15.9 13.3C15.9 12.4 15.3 11.8 14.2 11.2C13.5 10.8 13.1 10.6 13.1 10.2C13.1 9.9 13.4 9.5 14.2 9.5C14.8 9.5 15.3 9.6 15.7 9.8L15.9 9.9L16.5 8.7ZM19.5 8.5H18C17.5 8.5 17.1 8.7 16.9 9.2L14 15.5H16.1L16.5 14.4H19.1L19.3 15.5H21L19.5 8.5ZM17.1 12.8L18.1 10.2L18.7 12.8H17.1ZM8.5 8.5L6.5 13.3L6.3 12.2C5.9 11 4.8 9.7 3.5 9L5.3 15.5H7.4L10.6 8.5H8.5Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <rect width="24" height="24" rx="3" fill="currentColor" opacity="0.08" />
      <circle cx="9.5" cy="12" r="5" fill="currentColor" opacity="0.2" />
      <circle cx="14.5" cy="12" r="5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <rect width="24" height="24" rx="3" fill="currentColor" opacity="0.08" />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill="currentColor"
        opacity="0.6"
      >
        AX
      </text>
    </svg>
  );
}

function GenericCardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="shrink-0 opacity-40"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

const BRAND_ICONS: Record<string, () => JSX.Element> = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: GenericCardIcon,
};

function PaymentMethodDisplay({
  method,
}: {
  method: NonNullable<Order["paymentMethod"]>;
}) {
  const IconComponent = method.brand
    ? BRAND_ICONS[method.brand] || GenericCardIcon
    : GenericCardIcon;
  return (
    <div className="text-secondary-600 flex items-center gap-2 text-sm">
      <IconComponent />
      {method.last4 ? (
        <span className="font-mono text-xs">
          <span className="text-secondary-300 tracking-wider">
            &bull;&bull;&bull;&bull;
          </span>{" "}
          {method.last4}
        </span>
      ) : (
        <span className="text-xs">{method.label}</span>
      )}
    </div>
  );
}

// --- Helpers ---
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatOrderNumber(num: string): string {
  // Truncate long Stripe IDs for display
  if (num.length > 20) {
    return num.slice(0, 8) + "..." + num.slice(-4);
  }
  return num;
}

interface OrdersClientProps {
  orders: Order[];
  pagination: OrdersResponse["pagination"];
}

export default function OrdersClient({
  orders,
  pagination,
}: OrdersClientProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {/* Order Cards */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;

          return (
            <div
              key={order.id}
              className="border-secondary-100 overflow-hidden rounded-xl border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              {/* Order Header — always visible */}
              <button
                onClick={() => toggle(order.id)}
                className="hover:bg-secondary-50/50 flex w-full items-center justify-between p-5 text-left transition-colors"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="min-w-0">
                    <p className="text-secondary-900 text-sm font-medium">
                      Order #{formatOrderNumber(order.orderNumber)}
                    </p>
                    <p className="text-secondary-400 mt-0.5 text-xs">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-secondary-900 text-sm font-medium">
                    {formatCentsToDollars(order.total)}
                  </span>
                  <svg
                    className={`text-secondary-400 h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-secondary-100 border-t px-5 pb-5">
                  {/* Items */}
                  <div className="space-y-3 pt-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.image ? (
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="border-secondary-100 h-12 w-12 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="bg-secondary-50 flex h-12 w-12 items-center justify-center rounded-lg">
                            <svg
                              className="text-secondary-300 h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-secondary-900 truncate text-sm">
                            {item.name}
                          </p>
                          {item.variation && (
                            <p className="text-secondary-400 text-xs">
                              {item.variation}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-secondary-900 text-sm">
                            {formatCentsToDollars(item.price)}
                          </p>
                          <p className="text-secondary-400 text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total Breakdown */}
                  <div className="border-secondary-100 mt-4 border-t pt-4">
                    <div className="space-y-1.5 text-sm">
                      {order.subtotal != null && (
                        <div className="text-secondary-500 flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCentsToDollars(order.subtotal)}</span>
                        </div>
                      )}
                      {order.discountCents != null &&
                        order.discountCents > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>
                              Discount
                              {order.discountCode
                                ? ` (${order.discountCode})`
                                : ""}
                            </span>
                            <span>
                              −{formatCentsToDollars(order.discountCents)}
                            </span>
                          </div>
                        )}
                      {order.shipping != null && order.shipping > 0 && (
                        <div className="text-secondary-500 flex justify-between">
                          <span>Shipping</span>
                          <span>{formatCentsToDollars(order.shipping)}</span>
                        </div>
                      )}
                      {order.tax != null && order.tax > 0 && (
                        <div className="text-secondary-500 flex justify-between">
                          <span>Tax</span>
                          <span>{formatCentsToDollars(order.tax)}</span>
                        </div>
                      )}
                      <div className="text-secondary-900 border-secondary-100 flex justify-between border-t pt-1.5 font-medium">
                        <span>Total</span>
                        <span>{formatCentsToDollars(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  {order.paymentMethod && (
                    <div className="border-secondary-100 mt-4 border-t pt-4">
                      <p className="text-secondary-400 mb-2 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                        Payment
                      </p>
                      <PaymentMethodDisplay method={order.paymentMethod} />
                    </div>
                  )}

                  {/* Tracking */}
                  {order.tracking && (
                    <div className="border-secondary-100 mt-4 border-t pt-4">
                      <p className="text-secondary-400 mb-2 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                        Tracking
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-700 text-sm">
                          {order.tracking.carrier}:
                        </span>
                        {order.tracking.url ? (
                          <a
                            href={order.tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-400 font-mono text-sm transition-colors"
                          >
                            {order.tracking.trackingNumber}
                          </a>
                        ) : (
                          <span className="text-secondary-700 font-mono text-sm">
                            {order.tracking.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Downloads */}
                  {order.items.some(
                    (item) =>
                      item.downloadUrl || getDownloadUrlByName(item.name),
                  ) && (
                    <div className="border-secondary-100 mt-4 border-t pt-4">
                      <p className="text-secondary-400 mb-2 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                        Downloads
                      </p>
                      <div className="space-y-2">
                        {order.items
                          .filter(
                            (item) =>
                              item.downloadUrl ||
                              getDownloadUrlByName(item.name),
                          )
                          .map((item) => (
                            <a
                              key={item.id}
                              href={
                                item.downloadUrl ||
                                getDownloadUrlByName(item.name)!
                              }
                              download
                              className="group flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2.5 transition-colors hover:border-sky-300 hover:bg-sky-50"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-600">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-secondary-900 truncate text-sm font-medium">
                                  {item.name}
                                </p>
                                <p className="text-[0.65rem] text-sky-600">
                                  PDF Download
                                </p>
                              </div>
                              <svg
                                className="h-4 w-4 shrink-0 text-sky-500 transition-transform group-hover:translate-y-0.5"
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

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="border-secondary-100 mt-4 border-t pt-4">
                      <p className="text-secondary-400 mb-2 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                        Shipped To
                      </p>
                      <p className="text-secondary-700 text-sm">
                        {order.shippingAddress.line1}
                        {order.shippingAddress.line2 && (
                          <>, {order.shippingAddress.line2}</>
                        )}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zip}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {pagination.page > 1 && (
            <Link
              href={`/account/orders?page=${pagination.page - 1}`}
              className="border-secondary-200 hover:border-primary-300 rounded-lg border px-4 py-2 text-sm transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-secondary-500 px-3 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.page < pagination.totalPages && (
            <Link
              href={`/account/orders?page=${pagination.page + 1}`}
              className="border-secondary-200 hover:border-primary-300 rounded-lg border px-4 py-2 text-sm transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
