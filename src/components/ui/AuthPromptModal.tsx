'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Spinner } from '~/components/ui/Spinner';
import { useAuth } from '~/lib/auth';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type Tab = 'magic-link' | 'password';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  redirectPath?: string;
  onAuthenticated?: () => void;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = 'Sign in to continue',
  subtitle,
  redirectPath,
  onAuthenticated,
}: AuthPromptModalProps) {
  const pathname = usePathname();
  const redirect = redirectPath ?? pathname;
  const { refreshUser } = useAuth();

  const [tab, setTab] = useState<Tab>('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Reset all form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab('magic-link');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setFormState('idle');
      setErrorMessage('');
      setFieldErrors(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setFormState('idle');
    setErrorMessage('');
    setFieldErrors(new Set());
    setPassword('');
    setShowPassword(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors(new Set(['email']));
      setFormState('error');
      setErrorMessage('Please enter your email address.');
      return;
    }
    setFieldErrors(new Set());
    setFormState('submitting');
    setErrorMessage('');
    try {
      await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, redirect }),
      });
      // Always show success regardless of response (prevents email enumeration)
      setFormState('success');
    } catch {
      setFormState('success');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      const errors = new Set<string>();
      if (!trimmed) errors.add('email');
      if (!password) errors.add('password');
      setFieldErrors(errors);
      setFormState('error');
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setFieldErrors(new Set());
    setFormState('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Invalid email or password.');
      }
      // Hydrate customer context without page reload
      await refreshUser();
      onAuthenticated?.();
      onClose();
    } catch (err) {
      setFormState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-secondary-400 hover:text-secondary-600
            transition-colors duration-200"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h3 className="font-display text-lg font-bold text-secondary-900 mb-1 pr-8">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-secondary-500 mb-4">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-4" />}

        {/* Tab toggle */}
        <div className="flex bg-secondary-50 rounded-lg p-1 mb-5">
          <button
            onClick={() => switchTab('magic-link')}
            className={`flex-1 py-2 text-[0.65rem] font-mono tracking-[0.1em] uppercase rounded-md transition-all duration-200 ${
              tab === 'magic-link'
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-400 hover:text-secondary-600'
            }`}
          >
            Email Link
          </button>
          <button
            onClick={() => switchTab('password')}
            className={`flex-1 py-2 text-[0.65rem] font-mono tracking-[0.1em] uppercase rounded-md transition-all duration-200 ${
              tab === 'password'
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-400 hover:text-secondary-600'
            }`}
          >
            Password
          </button>
        </div>

        {/* ── Magic Link Tab ── */}
        {tab === 'magic-link' && (
          <>
            {formState === 'success' ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete('email'); return n; });
                    }}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`flex-1 min-w-0 border ${fieldErrors.has('email') ? 'border-red-400' : 'border-secondary-200'} rounded-lg px-4 py-3 text-sm
                      text-secondary-900 bg-white placeholder:text-secondary-300
                      focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
                      transition-all duration-200`}
                  />
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="px-4 py-3 rounded-lg bg-primary-500 text-[0.65rem] font-mono tracking-[0.1em]
                      text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98]
                      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {formState === 'submitting' ? <Spinner /> : 'Send Link'}
                  </button>
                </form>

                {formState === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                )}

                <p className="text-xs text-secondary-400">
                  No password needed — we&apos;ll email you a secure link.
                </p>
              </>
            )}
          </>
        )}

        {/* ── Password Tab ── */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-login-email"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                Email Address
              </label>
              <input
                id="modal-login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete('email'); return n; });
                }}
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full border ${fieldErrors.has('email') ? 'border-red-400' : 'border-secondary-200'} rounded-lg px-4 py-3 text-sm
                  text-secondary-900 bg-white placeholder:text-secondary-300
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
                  transition-all duration-200`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="modal-login-password"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="modal-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete('password'); return n; });
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full border ${fieldErrors.has('password') ? 'border-red-400' : 'border-secondary-200'} rounded-lg px-4 py-3 pr-12 text-sm
                    text-secondary-900 bg-white placeholder:text-secondary-300
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
                    transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {formState === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full py-3 rounded-lg bg-primary-500 text-[0.65rem] font-mono tracking-[0.1em]
                text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98]
                transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState === 'submitting' ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
