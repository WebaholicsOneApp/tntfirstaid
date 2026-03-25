import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerToken } from '~/lib/auth/cookies';
import { getMe } from '~/lib/auth/auth-api';
import { formatCentsToDollars, formatPhone } from '~/lib/utils';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'My Account' };

export default async function DashboardPage() {
  const token = await getCustomerToken();
  if (!token) redirect('/account');

  let customer;
  try {
    const data = await getMe(token);
    customer = data.customer;
  } catch {
    redirect('/account?expired=1');
  }

  const stats = customer.stats;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Account</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-secondary-900 mb-8">
          Welcome back, {customer.firstName}
        </h1>

        {/* Account Info Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 mb-6">
          <h2 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 mb-4">Account Details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-500">Name</span>
              <span className="text-sm font-medium text-secondary-900">{customer.firstName} {customer.lastName}</span>
            </div>
            <div className="h-px bg-secondary-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-500">Email</span>
              <span className="text-sm font-medium text-secondary-900">{customer.email}</span>
            </div>
            {customer.phone && (
              <>
                <div className="h-px bg-secondary-100" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-500">Phone</span>
                  <span className="text-sm font-medium text-secondary-900">{formatPhone(customer.phone)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
              <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-secondary-400 mb-1">Orders</p>
              <p className="text-2xl font-display font-bold text-secondary-900">{stats.orderCount}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
              <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-secondary-400 mb-1">Lifetime Spend</p>
              <p className="text-2xl font-display font-bold text-secondary-900">{formatCentsToDollars(stats.lifetimeValueCents)}</p>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link
            href="/account/profile"
            className="group bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 hover:border-primary-300 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">Profile</p>
                <p className="text-xs text-secondary-400">Name, phone & shipping address</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/orders"
            className="group bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 hover:border-primary-300 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">Order History</p>
                <p className="text-xs text-secondary-400">View past orders and tracking</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/security"
            className="group bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 hover:border-primary-300 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">Security</p>
                <p className="text-xs text-secondary-400">Manage your password</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Set password prompt */}
        {!customer.hasPassword && (
          <DashboardClient showPasswordPrompt />
        )}

        {/* Logout */}
        <DashboardClient showLogout />
      </div>
    </div>
  );
}
