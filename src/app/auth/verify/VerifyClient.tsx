'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '~/components/ui/Spinner';

type VerifyState = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const redirect = searchParams.get('redirect');
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setErrorMessage(data.error || 'This link is invalid or has already been used.');
          setState('error');
          return;
        }
        setState('success');
        // Small delay so user sees success before redirect
        setTimeout(() => {
          window.location.href = redirect || '/account/dashboard';
        }, 800);
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
        setState('error');
      }
    })();
  }, [token, redirect]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-secondary-100 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
              alt="Alpha Munitions"
              width={300}
              height={50}
              className="w-[160px] h-auto"
            />
          </div>

          {/* Verifying */}
          {state === 'verifying' && (
            <>
              <div className="flex justify-center mb-6">
                <Spinner className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-secondary-900 mb-2">Verifying your link…</h2>
              <p className="text-secondary-500 text-sm">Please wait while we sign you in.</p>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-secondary-900 mb-2">You&apos;re signed in!</h2>
              <p className="text-secondary-500 text-sm">Redirecting to your account…</p>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-secondary-900 mb-2">Link Invalid</h2>
              <p className="text-secondary-500 text-sm mb-6">{errorMessage}</p>
              <Link
                href="/account"
                className="inline-block py-3 px-8 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
              >
                Request a new link
              </Link>
            </>
          )}

          {/* No token */}
          {state === 'no-token' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-secondary-900 mb-2">Invalid Link</h2>
              <p className="text-secondary-500 text-sm mb-6">This sign-in link appears to be incomplete or malformed.</p>
              <Link
                href="/account"
                className="inline-block py-3 px-8 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
              >
                Go to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
