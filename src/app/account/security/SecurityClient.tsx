'use client';

import { useState } from 'react';
import { useAuth } from '~/lib/auth';
import { Spinner } from '~/components/ui/Spinner';
import type { Customer } from '~/types/auth';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface SecurityClientProps {
  customer: Customer;
}

export default function SecurityClient({ customer: initialCustomer }: SecurityClientProps) {
  const { customer, refreshUser } = useAuth();
  const hasPassword = customer?.hasPassword ?? initialCustomer.hasPassword;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (newPassword.length < 8) {
      setFormState('error');
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormState('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setFormState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to set password. Please try again.');
      }

      setFormState('success');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err) {
      setFormState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to set password. Please try again.',
      );
    }
  };

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">Password {hasPassword ? 'updated' : 'set'} successfully</p>
            <p className="text-xs text-secondary-400 mt-0.5">You can now sign in with your new password.</p>
          </div>
        </div>
        <button
          onClick={() => setFormState('idle')}
          className="mt-6 text-sm text-primary-500 hover:text-primary-400 transition-colors font-medium"
        >
          {hasPassword ? 'Change password again' : 'Update password'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
      <h2 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 mb-1">
        Password
      </h2>
      <p className="text-lg font-display font-semibold text-secondary-900 mb-6">
        {hasPassword ? 'Change password' : 'Set a password'}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        {formState === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="w-full py-3 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {formState === 'submitting' ? (
            <>
              <Spinner />
              Saving…
            </>
          ) : hasPassword ? (
            'Update Password'
          ) : (
            'Set Password'
          )}
        </button>
      </form>
    </div>
  );
}
