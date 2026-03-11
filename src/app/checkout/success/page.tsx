'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '~/lib/cart/CartContext';

interface OrderInfo {
  orderId: number | string;
  orderNumber: string | null;
  customerEmail: string | null;
}

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();

    // Fetch order information from either session_id or order_id
    const fetchOrderInfo = async () => {
      try {
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
        console.error('Error fetching order info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [clearCart, sessionId, orderId]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Order <span className="text-green-600">Confirmed!</span>
        </h1>

        {loading ? (
          <div className="py-8">
            <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-neutral-400 mt-4">Processing your order...</p>
          </div>
        ) : (
          <>
            {orderInfo?.orderNumber && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Order Number</p>
                <p className="text-2xl font-bold text-neutral-900">{orderInfo.orderNumber}</p>
              </div>
            )}

            <p className="text-neutral-600 mb-8 leading-relaxed">
              Thank you for your purchase! We&apos;ve sent a confirmation email with your order details.
            </p>
          </>
        )}

        <div className="space-y-4">
          <Link
            href="/shop"
            className="block w-full py-4 bg-[#C4A035] text-white font-bold rounded-2xl hover:bg-[#B08E2B] transition-all text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full py-4 bg-white text-neutral-600 font-bold rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-all text-sm"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-4">Need Help?</p>
          <div className="flex justify-center gap-6">
            <Link href="/contact" className="text-xs font-bold text-[#C4A035] hover:text-[#B08E2B] uppercase tracking-widest">
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
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4A035] border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
