'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImage } from '~/components/ui/ProductImage';
import AuthorizeNetCheckoutForm from '~/components/checkout/AuthorizeNetCheckoutForm';
import CheckoutAuthPrompt from '~/components/checkout/CheckoutAuthPrompt';
import ExpressCheckout from '~/components/checkout/ExpressCheckout';
import StripeProvider from '~/components/checkout/StripeProvider';
import { useCart } from '~/lib/cart/CartContext';
import { storeConfig } from '~/lib/store-config';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

interface PaymentConfig {
  providerType: 'stripe_connect' | 'authorize_net' | null;
  status: 'ready' | 'needs_action' | 'not_configured';
  stripePublishableKey: string | null;
  stripeConnectAccountId: string | null;
  authNetApiLoginId: string | null;
  authNetClientKey: string | null;
  authNetAcceptJsUrl: string | null;
  expressCheckoutEnabled: boolean;
  checkoutMode: string | null;
  supportedMethods: string[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState<string | null>(null);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

  useEffect(() => {
    if (cart.items.length !== 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (cart.items.length === 0) {
        router.push('/shop');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/checkout/config', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Unable to load checkout configuration.');
        }

        const config = (await response.json()) as PaymentConfig;
        setPaymentConfig(config);
        setStripePublishableKey(config.stripePublishableKey);
        setStripeConnectAccountId(config.stripeConnectAccountId);
      } catch (err) {
        console.error('Checkout config error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load checkout configuration.',
        );
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  const shippingCost = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const total = cart.subtotal + shippingCost + estimatedTax;

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (
        cart.items.length === 0 ||
        paymentConfig?.providerType !== 'stripe_connect' ||
        paymentConfig.status !== 'ready'
      ) {
        setClientSecret(null);
        setPaymentIntentId(null);
        setExpressCheckoutReady(false);
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

        if (!response.ok) {
          throw new Error('Failed to initialize Stripe checkout.');
        }

        const data = (await response.json()) as {
          clientSecret: string | null;
          paymentIntentId: string | null;
          publishableKey?: string | null;
          stripeConnectAccountId?: string | null;
        };

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setStripePublishableKey(
          data.publishableKey || paymentConfig.stripePublishableKey,
        );
        setStripeConnectAccountId(
          data.stripeConnectAccountId || paymentConfig.stripeConnectAccountId,
        );
        setExpressCheckoutReady(!!data.clientSecret);
      } catch (err) {
        console.error('Failed to create PaymentIntent:', err);
        setExpressCheckoutReady(false);
      }
    };

    createPaymentIntent();
  }, [cart.items, paymentConfig]);

  const handleExpressCheckoutSuccess = useCallback(
    async (stripePaymentIntentId: string, paymentMethod: string) => {
      setIsLoading(true);
      setError(null);

      try {
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

        const orderData = (await response.json()) as {
          orderId: number;
          orderNumber?: string | null;
        };

        clearCart();

        const params = new URLSearchParams({
          payment_intent: stripePaymentIntentId,
          order_id: String(orderData.orderId),
        });

        if (orderData.orderNumber) {
          params.set('order_number', orderData.orderNumber);
        }

        router.push(`/checkout/success?${params.toString()}`);
      } catch (err) {
        console.error('Order creation error:', err);
        setError('Payment succeeded but order creation failed. Please contact support.');
        setIsLoading(false);
      }
    },
    [cart, estimatedTax, total, clearCart, router],
  );

  const handleExpressCheckoutError = useCallback((message: string) => {
    setError(message);
  }, []);

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
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || 'Checkout failed');
      }

      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAuthorizeNetSuccess = useCallback(
    ({ orderId, orderNumber }: { orderId: number; orderNumber: string | null }) => {
      clearCart();

      const params = new URLSearchParams({
        order_id: String(orderId),
      });

      if (orderNumber) {
        params.set('order_number', orderNumber);
      }

      router.push(`/checkout/success?${params.toString()}`);
    },
    [clearCart, router],
  );

  const handleAuthorizeNetError = useCallback((message: string) => {
    setError(message || null);
  }, []);

  const renderCheckoutPanel = () => {
    if (configLoading) {
      return (
        <div className="rounded-2xl border border-secondary-100 bg-white p-6 text-sm text-secondary-500">
          Loading checkout options...
        </div>
      );
    }

    if (!paymentConfig || paymentConfig.status !== 'ready') {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Checkout is not configured for this storefront yet. Please contact Alpha Munitions support.
        </div>
      );
    }

    if (
      paymentConfig.providerType === 'authorize_net' &&
      paymentConfig.authNetApiLoginId &&
      paymentConfig.authNetClientKey &&
      paymentConfig.authNetAcceptJsUrl
    ) {
      return (
        <AuthorizeNetCheckoutForm
          apiLoginId={paymentConfig.authNetApiLoginId}
          clientKey={paymentConfig.authNetClientKey}
          acceptJsUrl={paymentConfig.authNetAcceptJsUrl}
          items={cart.items.map((item) => ({
            variationId: item.id,
            quantity: item.quantity,
          }))}
          totalLabel={formatCentsToDollars(total)}
          onSuccess={handleAuthorizeNetSuccess}
          onError={handleAuthorizeNetError}
        />
      );
    }

    if (
      paymentConfig.providerType === 'stripe_connect' &&
      stripePublishableKey
    ) {
      const expressSlot =
        paymentConfig.expressCheckoutEnabled &&
        clientSecret &&
        expressCheckoutReady &&
        paymentIntentId ? (
          <StripeProvider
            clientSecret={clientSecret}
            amount={total}
            primaryColor={storeConfig.primaryColor}
            publishableKey={stripePublishableKey}
            stripeAccountId={stripeConnectAccountId}
          >
            <ExpressCheckout
              items={cart.items}
              subtotal={cart.subtotal}
              tax={estimatedTax}
              total={total}
              paymentIntentId={paymentIntentId}
              onSuccess={handleExpressCheckoutSuccess}
              onError={handleExpressCheckoutError}
            />
          </StripeProvider>
        ) : undefined;

      return (
        <CheckoutAuthPrompt
          onGuestCheckout={handleCheckout}
          onAuthCheckout={handleCheckout}
          isLoading={isLoading}
          expressCheckoutSlot={expressSlot}
        />
      );
    }

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        This storefront payment configuration is incomplete.
      </div>
    );
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-secondary-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                Checkout
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-secondary-900">
              Complete Order
            </h1>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.1em] uppercase text-primary-600 transition-colors hover:text-primary-500"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white">
              <div className="border-b border-secondary-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Order Items ({cart.itemCount})
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-secondary-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 px-6 py-4">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary-50"
                    >
                      {item.image ? (
                        <ProductImage
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-secondary-300">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="line-clamp-2 text-sm leading-snug text-secondary-900 transition-colors hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="mt-0.5 text-sm text-secondary-500">{item.variation}</p>
                      )}
                      {item.manufacturerNo && (
                        <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                          SKU: {item.manufacturerNo}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-full border border-secondary-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-mono text-sm text-secondary-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-secondary-900">
                            {formatCentsToDollars(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-secondary-400 transition-colors hover:text-red-500"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-secondary-100 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-6 bg-primary-500" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                  Order Summary
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Subtotal</span>
                  <span className="font-medium text-secondary-900">
                    {formatCentsToDollars(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-secondary-500">Shipping</span>
                    <p className="text-xs text-secondary-400">3-5 business days</p>
                  </div>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Estimated Tax</span>
                  <span className="font-mono font-medium text-secondary-900">
                    {formatCentsToDollars(estimatedTax)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-secondary-100 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                    Total
                  </span>
                  <span className="font-display text-2xl font-bold text-secondary-900">
                    {formatCentsToDollars(total)}
                  </span>
                </div>
              </div>

              {paymentConfig?.providerType && (
                <div className="mt-4 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-secondary-400">
                    Payment Provider
                  </p>
                  <p className="mt-1 text-sm font-medium text-secondary-900">
                    {paymentConfig.providerType === 'authorize_net'
                      ? 'Authorize.net'
                      : 'Stripe Connect'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {renderCheckoutPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
