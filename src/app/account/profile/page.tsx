import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerToken } from '~/lib/auth/cookies';
import { getMe } from '~/lib/auth/auth-api';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const token = await getCustomerToken();
  if (!token) redirect('/account');

  let customer;
  try {
    const data = await getMe(token);
    customer = data.customer;
  } catch {
    redirect('/account?expired=1');
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-secondary-400 mb-6">
          <Link href="/account/dashboard" className="hover:text-primary-500 transition-colors">Account</Link>
          <span>/</span>
          <span className="text-secondary-600">Profile</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-primary-500" />
          <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Account</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-secondary-900 mb-8">Profile</h1>

        <ProfileClient customer={customer} />
      </div>
    </div>
  );
}
