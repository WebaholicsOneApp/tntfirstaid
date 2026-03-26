'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret: string;
  amount: number;
  primaryColor?: string;
  publishableKey: string;
  stripeAccountId?: string | null;
}

function getStripePromise(
  publishableKey: string,
  stripeAccountId?: string | null,
): Promise<Stripe | null> {
  const cacheKey = `${publishableKey}:${stripeAccountId || 'platform'}`;

  if (!stripePromiseCache.has(cacheKey)) {
    stripePromiseCache.set(
      cacheKey,
      loadStripe(
        publishableKey,
        stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
      ),
    );
  }

  return stripePromiseCache.get(cacheKey)!;
}

export default function StripeProvider({
  children,
  clientSecret,
  amount: _amount,
  primaryColor,
  publishableKey,
  stripeAccountId,
}: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: primaryColor || '#C4A035',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements
      stripe={getStripePromise(publishableKey, stripeAccountId)}
      options={options}
    >
      {children}
    </Elements>
  );
}
