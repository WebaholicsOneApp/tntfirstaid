'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
import type { Order, OrdersResponse } from '~/types/auth';
import { formatCentsToDollars } from '~/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] || 'bg-secondary-50 text-secondary-600 border-secondary-200';
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[0.6rem] font-mono tracking-[0.1em] uppercase rounded-full border ${style}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface OrdersClientProps {
  orders: Order[];
  pagination: OrdersResponse['pagination'];
}

export default function OrdersClient({ orders, pagination }: OrdersClientProps) {
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
              className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 overflow-hidden"
            >
              {/* Order Header — always visible */}
              <button
                onClick={() => toggle(order.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-secondary-400 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-secondary-900">
                    {formatCentsToDollars(order.total)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-secondary-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-secondary-100 px-5 pb-5">
                  {/* Items */}
                  <div className="pt-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.image ? (
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover border border-secondary-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-secondary-900 truncate">{item.name}</p>
                          {item.variation && (
                            <p className="text-xs text-secondary-400">{item.variation}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-secondary-900">{formatCentsToDollars(item.price)}</p>
                          <p className="text-xs text-secondary-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking */}
                  {order.tracking && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-secondary-400 mb-2">Tracking</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-700">{order.tracking.carrier}:</span>
                        {order.tracking.url ? (
                          <a
                            href={order.tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:text-primary-400 transition-colors font-mono"
                          >
                            {order.tracking.trackingNumber}
                          </a>
                        ) : (
                          <span className="text-sm font-mono text-secondary-700">{order.tracking.trackingNumber}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-secondary-400 mb-2">Shipped To</p>
                      <p className="text-sm text-secondary-700">
                        {order.shippingAddress.line1}
                        {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
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
        <div className="flex items-center justify-center gap-2 mt-8">
          {pagination.page > 1 && (
            <Link
              href={`/account/orders?page=${pagination.page - 1}`}
              className="px-4 py-2 text-sm border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-secondary-500 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.page < pagination.totalPages && (
            <Link
              href={`/account/orders?page=${pagination.page + 1}`}
              className="px-4 py-2 text-sm border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
