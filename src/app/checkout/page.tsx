'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';
import StripeProvider from '~/components/checkout/StripeProvider';
import ExpressCheckout from '~/components/checkout/ExpressCheckout';
import { storeConfig } from '~/lib/store-config';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Express Checkout state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

  // Redirect to shop if empty
  useEffect(() => {
    if (cart.items.length === 0) {
      const timer = setTimeout(() => {
        if (cart.items.length === 0) {
          router.push('/shop');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cart.items.length, router]);

  const shippingCost = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const total = cart.subtotal + shippingCost + estimatedTax;

  // Create PaymentIntent for Express Checkout
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cart.items.length === 0) {
        setClientSecret(null);
        setPaymentIntentId(null);
        return;
      }

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.items.map((item) => ({
              variationId: item.id,
              productId: item.productId,
              name: item.name,
              variation: item.variation,
              manufacturerNo: item.manufacturerNo,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.image || undefined,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          setExpressCheckoutReady(true);
        }
      } catch (err) {
        console.error('Failed to create PaymentIntent:', err);
      }
    };

    createPaymentIntent();
  }, [cart.items]);

  // Handle Express Checkout success
  const handleExpressCheckoutSuccess = useCallback(
    async (stripePaymentIntentId: string, paymentMethod: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create order via proxy route (adds storeId/companyId server-side)
        const response = await fetch('/api/express-checkout-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripePaymentIntentId,
            customerEmail: 'express-checkout@alphamunitions.com',
            paymentMethod,
            items: cart.items.map((item) => ({
              variationId: item.id,
              productId: item.productId,
              name: item.name,
              variation: item.variation || null,
              manufacturerNo: item.manufacturerNo || null,
              imageUrl: item.image || null,
              quantity: item.quantity,
              price: item.price,
              tax: Math.round(item.price * item.quantity * 0.08),
            })),
            subtotal: cart.subtotal,
            shippingCost: 0,
            tax: estimatedTax,
            total,
            shippingAddress: {
              name: 'Express Checkout',
              line1: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'US',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const orderData = await response.json();
        clearCart();

        // Redirect to success page
        router.push(
          `/checkout/success?payment_intent=${stripePaymentIntentId}&order_id=${orderData.orderId}`
        );
      } catch (err) {
        console.error('Order creation error:', err);
        setError('Payment succeeded but order creation failed. Please contact support.');
        setIsLoading(false);
      }
    },
    [cart, estimatedTax, total, clearCart, router]
  );

  // Handle Express Checkout error
  const handleExpressCheckoutError = useCallback((message: string) => {
    setError(message);
  }, []);

  // Handle regular checkout (redirect to Stripe hosted page)
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            variationId: item.id,
            productId: item.productId,
            name: item.name,
            variation: item.variation,
            manufacturerNo: item.manufacturerNo,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.image || undefined,
          })),
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Checkout failed');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#C4A035] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-neutral-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Checkout
          </h1>
          <Link
            href="/shop"
            className="text-[#C4A035] hover:text-[#B08E2B] font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Order Items ({cart.itemCount})
                </h2>
              </div>
              <ul className="divide-y divide-neutral-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="px-6 py-4 flex gap-4">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="font-medium text-neutral-900 hover:text-[#C4A035] transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="text-sm text-neutral-500 mt-0.5">{item.variation}</p>
                      )}
                      {item.manufacturerNo && (
                        <p className="text-xs text-neutral-400 mt-0.5">SKU: {item.manufacturerNo}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors rounded-l-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-1.5 text-sm font-medium text-neutral-700 min-w-[48px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors rounded-r-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-neutral-900">
                            {formatCentsToDollars(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium text-neutral-900">
                    {formatCentsToDollars(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-neutral-600">Shipping</span>
                    <p className="text-xs text-neutral-400">3-5 business days</p>
                  </div>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Estimated Tax</span>
                  <span className="font-medium text-neutral-900">
                    {formatCentsToDollars(estimatedTax)}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 mt-4 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-bold text-neutral-900">{formatCentsToDollars(total)}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Express Checkout (Apple Pay, Google Pay) */}
              {clientSecret && expressCheckoutReady && (
                <div className="mt-6">
                  <StripeProvider clientSecret={clientSecret} amount={total} primaryColor={storeConfig.primaryColor}>
                    <ExpressCheckout
                      items={cart.items}
                      subtotal={cart.subtotal}
                      tax={estimatedTax}
                      total={total}
                      paymentIntentId={paymentIntentId || ''}
                      onSuccess={handleExpressCheckoutSuccess}
                      onError={handleExpressCheckoutError}
                    />
                  </StripeProvider>
                </div>
              )}

              {/* Standard Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full mt-4 py-4 px-6 bg-[#C4A035] text-white font-semibold rounded-xl hover:bg-[#B08E2B] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Proceed to Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
