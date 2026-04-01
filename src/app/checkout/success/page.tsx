'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '~/lib/cart/CartContext';
import RecommendationGrid from '~/components/products/RecommendationGrid';
import type { ProductListItem } from '~/types';

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
  const orderNumberParam = searchParams.get('order_number');
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);

  useEffect(() => {
    // Save product IDs for recommendations before clearing cart
    try {
      const cartStr = localStorage.getItem('alpha-munitions-cart');
      if (cartStr) {
        const parsed = JSON.parse(cartStr);
        const ids = (parsed?.items || [])
          .map((i: { productId?: number }) => i.productId)
          .filter(Boolean);
        if (ids.length > 0) {
          sessionStorage.setItem('alpha-checkout-product-ids', JSON.stringify(ids));
        }
      }
    } catch { /* ignore parse errors */ }

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
        console.error('Error fetching order info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [clearCart, sessionId, orderId, orderNumberParam]);

  // Fetch recommendations based on recently ordered products
  useEffect(() => {
    try {
      const savedIds = sessionStorage.getItem('alpha-checkout-product-ids');
      if (!savedIds) return;
      const productIds: number[] = JSON.parse(savedIds);
      if (productIds.length === 0) return;

      fetch(`/api/recommendations?productIds=${productIds.join(',')}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.recommendations?.length) {
            setRecommendations(data.recommendations);
          }
        })
        .catch(() => {});

      sessionStorage.removeItem('alpha-checkout-product-ids');
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-secondary-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
          Order <span className="text-green-600">Confirmed!</span>
        </h1>

        {loading ? (
          <div className="py-8">
            <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-secondary-400 mt-4">Processing your order...</p>
          </div>
        ) : (
          <>
            {orderInfo?.orderNumber && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Order Number</p>
                <p className="text-2xl font-bold text-secondary-900">{orderInfo.orderNumber}</p>
              </div>
            )}

            <p className="text-secondary-600 mb-8 leading-relaxed">
              Thank you for your purchase! We&apos;ve sent a confirmation email with your order details.
            </p>
          </>
        )}

        {/* You May Also Like */}
        {recommendations.filter(r => r.inStock).length > 0 && (
          <div className="mt-8 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                Recommended
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-secondary-900 mb-4">
              Customers Also Bought
            </h2>
            <RecommendationGrid products={recommendations.filter(r => r.inStock).slice(0, 5)} />
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/shop"
            className="block w-full py-3 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase text-center hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full py-3 rounded-full border border-primary-500/40 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase text-center hover:border-primary-500 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-100">
          <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest mb-4">Need Help?</p>
          <div className="flex justify-center gap-6">
            <Link href="/contact" className="font-mono text-[0.7rem] tracking-[0.15em] text-primary-600 hover:text-primary-500 uppercase transition-colors">
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
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
