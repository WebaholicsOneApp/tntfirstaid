import { Suspense } from 'react';
import VerifyClient from './VerifyClient';
import { Spinner } from '~/components/ui/Spinner';

export const metadata = { title: 'Verify Sign-In' };

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
          <Spinner className="w-8 h-8 text-primary-500" />
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
