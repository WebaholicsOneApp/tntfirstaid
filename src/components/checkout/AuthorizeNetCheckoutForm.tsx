'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '~/components/ui/Spinner';
import { useAuth } from '~/lib/auth';

declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
            zip?: string;
            fullName?: string;
          };
        },
        callback: (response: {
          messages: {
            resultCode: 'Ok' | 'Error';
            message: Array<{ code: string; text: string }>;
          };
          opaqueData?: { dataDescriptor: string; dataValue: string };
        }) => void,
      ) => void;
    };
  }
}

interface CartItemInput {
  variationId: number;
  quantity: number;
}

interface AuthorizeNetCheckoutFormProps {
  apiLoginId: string;
  clientKey: string;
  acceptJsUrl: string;
  items: CartItemInput[];
  totalLabel: string;
  onSuccess: (result: { orderId: number; orderNumber: string | null }) => void;
  onError: (message: string) => void;
}

type ScriptStatus = 'loading' | 'ready' | 'error';

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 6);

  if (digits.length <= 2) return digits;

  const month = digits.slice(0, 2);
  const year = digits.slice(2);

  return `${month}/${year}`;
}

function parseExpiry(expiry: string): { month: string; year: string } | null {
  const [monthRaw, yearRaw] = expiry.split('/');
  const month = monthRaw?.trim() || '';
  const year = yearRaw?.trim() || '';

  if (!month || !year || month.length !== 2) {
    return null;
  }

  const monthNumber = Number(month);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  if (year.length !== 2 && year.length !== 4) {
    return null;
  }

  return {
    month,
    year: year.length === 2 ? `20${year}` : year,
  };
}

export default function AuthorizeNetCheckoutForm({
  apiLoginId,
  clientKey,
  acceptJsUrl,
  items,
  totalLabel,
  onSuccess,
  onError,
}: AuthorizeNetCheckoutFormProps) {
  const {
    customer,
    isAuthenticated,
    customerAuthEnabled,
  } = useAuth();

  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardCode, setCardCode] = useState('');

  useEffect(() => {
    if (!customer) return;

    setEmail((current) => current || customer.email || '');
    setFullName((current) => {
      if (current) return current;
      return [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    });
    setPhone((current) => current || customer.phone || '');
    setLine1((current) => current || customer.defaultAddress?.line1 || '');
    setLine2((current) => current || customer.defaultAddress?.line2 || '');
    setCity((current) => current || customer.defaultAddress?.city || '');
    setState((current) => current || customer.defaultAddress?.state || '');
    setPostalCode((current) => current || customer.defaultAddress?.postalCode || '');
    setCountry((current) => current || customer.defaultAddress?.country || 'US');
  }, [customer]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (window.Accept) {
      setScriptStatus('ready');
      return undefined;
    }

    setScriptStatus('loading');

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-authorize-net="${acceptJsUrl}"]`,
    );

    const handleLoad = () => setScriptStatus('ready');
    const handleError = () => setScriptStatus('error');

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = acceptJsUrl;
    script.async = true;
    script.dataset.authorizeNet = acceptJsUrl;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [acceptJsUrl]);

  const readinessMessage = useMemo(() => {
    if (scriptStatus === 'loading') {
      return 'Loading secure card form...';
    }

    if (scriptStatus === 'error') {
      return 'Unable to load the secure card form. Refresh the page and try again.';
    }

    return null;
  }, [scriptStatus]);

  const tokenizeCard = async () => {
    const parsedExpiry = parseExpiry(expiry);
    if (!parsedExpiry) {
      throw new Error('Enter a valid expiration date in MM/YY format.');
    }

    if (!window.Accept) {
      throw new Error('Secure card form is not ready yet.');
    }

    return await new Promise<{ dataDescriptor: string; dataValue: string }>(
      (resolve, reject) => {
        window.Accept?.dispatchData(
          {
            authData: {
              clientKey,
              apiLoginID: apiLoginId,
            },
            cardData: {
              cardNumber: cardNumber.replace(/\D/g, ''),
              month: parsedExpiry.month,
              year: parsedExpiry.year,
              cardCode: cardCode.replace(/\D/g, ''),
              zip: postalCode.trim(),
              fullName: fullName.trim(),
            },
          },
          (response) => {
            if (response.messages.resultCode === 'Error' || !response.opaqueData) {
              const message =
                response.messages.message.map((item) => item.text).join(' ') ||
                'Card verification failed.';
              reject(new Error(message));
              return;
            }

            resolve(response.opaqueData);
          },
        );
      },
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    onError('');

    if (!email.trim()) {
      const message = 'Email address is required.';
      setLocalError(message);
      onError(message);
      return;
    }

    if (!fullName.trim() || !line1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      const message = 'Complete the shipping address before submitting payment.';
      setLocalError(message);
      onError(message);
      return;
    }

    if (cardNumber.replace(/\D/g, '').length < 13 || cardCode.replace(/\D/g, '').length < 3) {
      const message = 'Enter a valid card number and security code.';
      setLocalError(message);
      onError(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const opaqueData = await tokenizeCard();

      const response = await fetch('/api/authorize-net/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: email.trim(),
          phoneNumber: phone.trim() || undefined,
          items,
          opaqueData,
          shippingAddress: {
            name: fullName.trim(),
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: country.trim() || 'US',
          },
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        orderId?: number;
        orderNumber?: string;
      };

      if (!response.ok || !result.orderId) {
        throw new Error(result.error || 'Payment failed.');
      }

      setCardNumber('');
      setExpiry('');
      setCardCode('');
      onSuccess({
        orderId: result.orderId,
        orderNumber: result.orderNumber || null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to process payment.';
      setLocalError(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px w-6 bg-primary-500" />
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
          Secure Card Checkout
        </span>
      </div>

      <div className="mb-5 space-y-2">
        <h3 className="font-display text-xl font-bold text-secondary-900">
          Pay with card
        </h3>
        <p className="text-sm text-secondary-500">
          Alpha Munitions is using Authorize.net embedded checkout for this storefront.
        </p>
        {customerAuthEnabled && !isAuthenticated && (
          <p className="text-xs text-secondary-400">
            Want faster checkout next time?{' '}
            <Link
              href="/account?redirect=/checkout"
              className="text-primary-500 hover:text-primary-400"
            >
              Sign in to your account.
            </Link>
          </p>
        )}
        {isAuthenticated && customer && (
          <p className="text-xs text-green-700">
            Signed in as {customer.email}. Your saved shipping details have been prefilled below.
          </p>
        )}
      </div>

      {readinessMessage && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            scriptStatus === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-secondary-200 bg-secondary-50 text-secondary-500'
          }`}
        >
          {readinessMessage}
        </div>
      )}

      {localError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {localError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              Full Name
            </span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="tel"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              Country
            </span>
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="country"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
            Address Line 1
          </span>
          <input
            value={line1}
            onChange={(event) => setLine1(event.target.value)}
            className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            autoComplete="address-line1"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
            Address Line 2
          </span>
          <input
            value={line2}
            onChange={(event) => setLine2(event.target.value)}
            className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            autoComplete="address-line2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              City
            </span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="address-level2"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              State
            </span>
            <input
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="address-level1"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
              ZIP
            </span>
            <input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className="w-full rounded-xl border border-secondary-200 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoComplete="postal-code"
              required
            />
          </label>
        </div>

        <div className="rounded-2xl border border-secondary-100 bg-secondary-50/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-secondary-900">
                Card Details
              </p>
              <p className="text-xs text-secondary-500">
                Card details are tokenized by Authorize.net before anything is sent to the server.
              </p>
            </div>
            <span className="rounded-full border border-secondary-200 bg-white px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.12em] text-secondary-500">
              Total {totalLabel}
            </span>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
                Card Number
              </span>
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="4111 1111 1111 1111"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
                  Expiration
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="MM/YY"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-secondary-400">
                  Security Code
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cardCode}
                  onChange={(event) => setCardCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="CVV"
                  required
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || scriptStatus !== 'ready'}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-[0.7rem] font-mono uppercase tracking-[0.15em] text-secondary-950 transition-all duration-300 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Processing Payment...
            </>
          ) : (
            'Submit Secure Payment'
          )}
        </button>
      </form>
    </div>
  );
}
