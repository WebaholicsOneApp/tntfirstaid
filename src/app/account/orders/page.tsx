import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerToken } from '~/lib/auth/cookies';
import { getOrders } from '~/lib/auth/auth-api';
import OrdersClient from './OrdersClient';

export const metadata = { title: 'Order History' };

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const token = await getCustomerToken();
  if (!token) redirect('/account');

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));

  let data;
  try {
    data = await getOrders(token, page, 10);
  } catch {
    redirect('/account?expired=1');
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-secondary-400 mb-6">
          <Link href="/account/dashboard" className="hover:text-primary-500 transition-colors mr-1" aria-label="Back to account">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/account/dashboard" className="hover:text-primary-500 transition-colors">Account</Link>
          <span>/</span>
          <span className="text-secondary-600">Orders</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Account</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-secondary-900 mb-8">Order History</h1>

        {data.orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-lg font-bold text-secondary-900 mb-2">No orders yet</h2>
            <p className="text-secondary-500 text-sm mb-6">Once you place an order, it will appear here.</p>
            <Link
              href="/shop"
              className="inline-block py-3 px-8 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <OrdersClient orders={data.orders} pagination={data.pagination} />
        )}
      </div>
    </div>
  );
}
