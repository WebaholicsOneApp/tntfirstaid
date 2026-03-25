'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '~/lib/auth';
import { Spinner } from '~/components/ui/Spinner';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface CheckoutAuthPromptProps {
  onGuestCheckout: () => void;
  onAuthCheckout: () => void;
  isLoading: boolean;
  expressCheckoutSlot?: ReactNode;
}

export default function CheckoutAuthPrompt({
  onGuestCheckout,
  onAuthCheckout,
  isLoading,
  expressCheckoutSlot,
}: CheckoutAuthPromptProps) {
  const { isAuthenticated, customerAuthEnabled, customer, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // When user verifies magic link in another tab and comes back, refresh auth state
  useEffect(() => {
    const handleFocus = () => {
      refreshUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUser]);

  // Auth disabled — render express checkout slot + checkout button directly
  if (!customerAuthEnabled) {
    return (
      <>
        {expressCheckoutSlot}
        <button
          onClick={onGuestCheckout}
          disabled={isLoading}
          className="w-full mt-4 py-3 px-6 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
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
      </>
    );
  }

  // Logged in — show account info + checkout button
  if (isAuthenticated && customer) {
    const addr = customer.defaultAddress;

    return (
      <div className="mt-6 rounded-2xl border border-secondary-100 p-6">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-6 bg-primary-500" />
          <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Account</span>
        </div>

        {/* Signed-in info */}
        <div className="flex items-start gap-2 mb-1">
          <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-900">
              Signed in as {customer.email}
            </p>
            <p className="text-sm text-secondary-500">
              {customer.firstName} {customer.lastName}
            </p>
            {addr && (
              <p className="text-xs text-secondary-400 mt-0.5">
                {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-secondary-400 mt-3 mb-4">
          Your info will be pre-filled at checkout.
        </p>

        {/* Express checkout slot */}
        {expressCheckoutSlot}

        {/* Proceed button */}
        <button
          onClick={onAuthCheckout}
          disabled={isLoading}
          className="w-full mt-4 py-3 px-6 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
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
    );
  }

  // Not logged in + auth enabled — magic link prompt
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setFormState('error');
      setErrorMessage('Please enter your email address.');
      return;
    }
    setFormState('submitting');
    setErrorMessage('');
    try {
      await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      // Always show success regardless of response (prevents email enumeration)
      setFormState('success');
    } catch {
      setFormState('success'); // Still show success
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-secondary-100 p-6">
      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px w-6 bg-primary-500" />
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Account</span>
      </div>

      <h3 className="font-display text-lg font-bold text-secondary-900 mb-1">
        Sign in for faster checkout
      </h3>
      <p className="text-sm text-secondary-500 mb-4">
        Save your info, track orders, and speed up future purchases.
      </p>

      {/* Magic link form / success state */}
      {formState === 'success' ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Check your email</p>
              <p className="text-xs text-green-600 mt-0.5">
                If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a sign-in link. It expires in 15 minutes.
              </p>
              <button
                onClick={() => { setFormState('idle'); setEmail(''); }}
                className="text-green-700 hover:text-green-800 text-xs font-medium mt-2 transition-colors"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleMagicLink} noValidate className="flex gap-2 mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="flex-1 min-w-0 border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
            />
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="px-4 py-3 rounded-lg bg-primary-500 text-[0.65rem] font-mono tracking-[0.1em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
            >
              {formState === 'submitting' ? (
                <Spinner />
              ) : (
                'Send Link'
              )}
            </button>
          </form>

          {formState === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </>
      )}

      {/* Password login link */}
      <p className="text-xs text-secondary-400 mb-4">
        Already have a password?{' '}
        <Link
          href="/account?redirect=/checkout"
          className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
        >
          Sign in &rarr;
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-secondary-100" />
        <span className="text-secondary-300 text-xs">or</span>
        <div className="flex-1 h-px bg-secondary-100" />
      </div>

      {/* Express checkout slot */}
      {expressCheckoutSlot}

      {/* Continue as Guest */}
      <button
        onClick={onGuestCheckout}
        disabled={isLoading}
        className="w-full mt-4 py-3 px-6 rounded-full border border-secondary-200 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-500 uppercase hover:border-secondary-300 hover:text-secondary-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Continue as Guest'
        )}
      </button>
    </div>
  );
}
