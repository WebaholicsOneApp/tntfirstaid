'use client';

import { useState } from 'react';
import {
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  price: number;
  quantity: number;
  image?: string | null;
  productSlug: string;
}

interface ExpressCheckoutProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentIntentId: string;
  onSuccess: (paymentIntentId: string, paymentMethod: string) => void;
  onError: (message: string) => void;
}

export default function ExpressCheckout({
  items: _items,
  subtotal: _subtotal,
  tax: _tax,
  total: _total,
  paymentIntentId: _paymentIntentId,
  onSuccess,
  onError,
}: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);

  const handleConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Determine payment method type
        const pmType = event.expressPaymentType || 'card';
        let paymentMethod = 'card';
        if (pmType === 'apple_pay') paymentMethod = 'apple_pay';
        else if (pmType === 'google_pay') paymentMethod = 'google_pay';
        else if (pmType === 'amazon_pay') paymentMethod = 'amazon_pay';
        else if (pmType === 'link') paymentMethod = 'link';

        onSuccess(paymentIntent.id, paymentMethod);
      }
    } catch (err) {
      console.error('Express checkout error:', err);
      onError('Payment failed. Please try again.');
    }
  };

  const handleReady = ({ availablePaymentMethods }: { availablePaymentMethods?: Record<string, boolean> }) => {
    if (availablePaymentMethods) {
      const hasMethod = Object.values(availablePaymentMethods).some(Boolean);
      setIsReady(hasMethod);
    }
  };

  return (
    <div className="express-checkout-container">
      {!isReady && (
        <p className="mb-3 text-xs text-secondary-400">
          Checking Apple Pay and Google Pay availability...
        </p>
      )}
      <div className={isReady ? '' : 'pointer-events-none opacity-0'}>
        <ExpressCheckoutElement
          onConfirm={handleConfirm}
          onReady={handleReady}
          options={{
            buttonType: {
              applePay: 'buy',
              googlePay: 'buy',
            },
            buttonTheme: {
              applePay: 'black',
              googlePay: 'black',
            },
            layout: {
              maxColumns: 2,
              maxRows: 1,
            },
            paymentMethods: {
              applePay: 'always',
              googlePay: 'always',
              link: 'auto',
            },
          }}
        />
      </div>
    </div>
  );
}
