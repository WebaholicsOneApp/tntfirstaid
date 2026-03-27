'use client';

import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '~/components/ui/Spinner';
import type { ShippingFields } from '~/components/checkout/ShippingForm';

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
  shippingData: ShippingFields;
  onSuccess: (result: { orderId: number; orderNumber: string | null }) => void;
  onError: (message: string) => void;
  onShippingFieldErrors?: (errors: Set<string>) => void;
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
  shippingData,
  onSuccess,
  onError,
  onShippingFieldErrors,
}: AuthorizeNetCheckoutFormProps) {
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [shippingFieldErrors, setShippingFieldErrors] = useState<Set<string>>(new Set());

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
              zip: shippingData.postalCode.trim(),
              fullName: shippingData.name.trim(),
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

    const cardErrors = new Set<string>();
    const shipErrors = new Set<string>();

    if (!shippingData.email.trim()) shipErrors.add('email');
    if (!shippingData.name.trim()) shipErrors.add('name');
    if (!shippingData.line1.trim()) shipErrors.add('line1');
    if (!shippingData.city.trim()) shipErrors.add('city');
    if (!shippingData.state.trim()) shipErrors.add('state');
    if (!shippingData.postalCode.trim()) shipErrors.add('postalCode');
    if (cardNumber.replace(/\D/g, '').length < 13) cardErrors.add('cardNumber');
    if (cardCode.replace(/\D/g, '').length < 3) cardErrors.add('cardCode');

    if (shipErrors.size > 0 || cardErrors.size > 0) {
      setFieldErrors(cardErrors);
      setShippingFieldErrors(shipErrors);
      onShippingFieldErrors?.(shipErrors);
      const message = shipErrors.size > 0
        ? 'Complete the shipping address above before submitting payment.'
        : 'Enter a valid card number and security code.';
      setLocalError(message);
      onError(message);
      return;
    }
    setFieldErrors(new Set());
    setShippingFieldErrors(new Set());
    onShippingFieldErrors?.(new Set());

    setIsSubmitting(true);

    try {
      const opaqueData = await tokenizeCard();

      const response = await fetch('/api/authorize-net/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: shippingData.email.trim(),
          phoneNumber: shippingData.phone.trim() || undefined,
          items,
          opaqueData,
          shippingAddress: {
            name: shippingData.name.trim(),
            line1: shippingData.line1.trim(),
            line2: shippingData.line2.trim() || undefined,
            city: shippingData.city.trim(),
            state: shippingData.state.trim(),
            postalCode: shippingData.postalCode.trim(),
            country: shippingData.country.trim() || 'US',
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
    <>
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
                onChange={(event) => {
                  setCardNumber(formatCardNumber(event.target.value));
                  if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete('cardNumber'); return n; });
                }}
                className={`w-full rounded-xl border ${fieldErrors.has('cardNumber') ? 'border-red-400' : 'border-secondary-200'} bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
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
                  onChange={(event) => {
                    setCardCode(event.target.value.replace(/\D/g, '').slice(0, 4));
                    if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete('cardCode'); return n; });
                  }}
                  className={`w-full rounded-xl border ${fieldErrors.has('cardCode') ? 'border-red-400' : 'border-secondary-200'} bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
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
    </>
  );
}
