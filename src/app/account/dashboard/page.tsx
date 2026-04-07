import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerToken } from "~/lib/auth/cookies";
import { getMe } from "~/lib/auth/auth-api";
import { formatCentsToDollars, formatPhone } from "~/lib/utils";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "My Account" };

export default async function DashboardPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/account");

  let customer;
  try {
    const data = await getMe(token);
    customer = data.customer;
  } catch {
    redirect("/account?expired=1");
  }

  const stats = customer.stats;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
            Account
          </span>
        </div>
        <h1 className="font-display text-secondary-900 mb-8 text-3xl font-bold">
          Welcome back, {customer.firstName}
        </h1>

        {/* Account Info Card */}
        <div className="border-secondary-100 mb-6 rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8">
          <h2 className="text-secondary-400 mb-4 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
            Account Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 text-sm">Name</span>
              <span className="text-secondary-900 text-sm font-medium">
                {customer.firstName} {customer.lastName}
              </span>
            </div>
            <div className="bg-secondary-100 h-px" />
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 text-sm">Email</span>
              <span className="text-secondary-900 text-sm font-medium">
                {customer.email}
              </span>
            </div>
            {customer.phone && (
              <>
                <div className="bg-secondary-100 h-px" />
                <div className="flex items-center justify-between">
                  <span className="text-secondary-500 text-sm">Phone</span>
                  <span className="text-secondary-900 text-sm font-medium">
                    {formatPhone(customer.phone)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="border-secondary-100 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <p className="text-secondary-400 mb-1 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                Orders
              </p>
              <p className="font-display text-secondary-900 text-2xl font-bold">
                {stats.orderCount}
              </p>
            </div>
            <div className="border-secondary-100 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <p className="text-secondary-400 mb-1 font-mono text-[0.55rem] tracking-[0.3em] uppercase">
                Lifetime Spend
              </p>
              <p className="font-display text-secondary-900 text-2xl font-bold">
                {formatCentsToDollars(stats.lifetimeValueCents)}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/account/profile"
            className="group border-secondary-100 hover:border-primary-300 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-lg">
                <svg
                  className="text-primary-500 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-secondary-900 group-hover:text-primary-600 text-sm font-medium transition-colors">
                  Profile
                </p>
                <p className="text-secondary-400 text-xs">
                  Name, phone & shipping address
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/orders"
            className="group border-secondary-100 hover:border-primary-300 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-lg">
                <svg
                  className="text-primary-500 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-secondary-900 group-hover:text-primary-600 text-sm font-medium transition-colors">
                  Order History
                </p>
                <p className="text-secondary-400 text-xs">
                  View past orders and tracking
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/security"
            className="group border-secondary-100 hover:border-primary-300 rounded-xl border bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-lg">
                <svg
                  className="text-primary-500 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-secondary-900 group-hover:text-primary-600 text-sm font-medium transition-colors">
                  Security
                </p>
                <p className="text-secondary-400 text-xs">
                  Manage your password
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Set password prompt */}
        {!customer.hasPassword && <DashboardClient showPasswordPrompt />}

        {/* Logout */}
        <DashboardClient showLogout />
      </div>
    </div>
  );
}
