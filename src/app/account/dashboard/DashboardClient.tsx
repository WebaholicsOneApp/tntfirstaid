'use client';

import { useState } from 'react';
import { useAuth } from '~/lib/auth';
import { Spinner } from '~/components/ui/Spinner';

interface DashboardClientProps {
  showPasswordPrompt?: boolean;
  showLogout?: boolean;
}

export default function DashboardClient({ showPasswordPrompt, showLogout }: DashboardClientProps) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Password form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwState, setPwState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setPwState('error');
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPwState('error');
      setPwError('Passwords do not match.');
      return;
    }
    setPwState('submitting');
    setPwError('');
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Failed to set password.');
      }
      setPwState('success');
    } catch (err) {
      setPwState('error');
      setPwError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (showPasswordPrompt) {
    if (pwState === 'success') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700 font-medium">Password set! You can now sign in with your email and password.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-primary-50/50 border border-primary-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-secondary-900 mb-1">Set a password for faster sign-in</h3>
        <p className="text-xs text-secondary-500 mb-4">Optional — you can always use email links instead.</p>
        <form onSubmit={handleSetPassword} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            autoComplete="new-password"
            className="w-full border border-secondary-200 rounded-lg px-4 py-2.5 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="w-full border border-secondary-200 rounded-lg px-4 py-2.5 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
          {pwState === 'error' && (
            <p className="text-red-600 text-xs font-medium">{pwError}</p>
          )}
          <button
            type="submit"
            disabled={pwState === 'submitting'}
            className="py-2.5 px-6 rounded-full bg-primary-500 text-[0.65rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pwState === 'submitting' ? <><Spinner /> Setting…</> : 'Set Password'}
          </button>
        </form>
      </div>
    );
  }

  if (showLogout) {
    return (
      <div className="pt-4 border-t border-secondary-100">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-secondary-400 hover:text-red-500 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loggingOut ? <><Spinner /> Signing out…</> : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
}
