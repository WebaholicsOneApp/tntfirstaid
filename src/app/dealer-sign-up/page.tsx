import type { Metadata } from 'next';
import Image from 'next/image';
import DealerSignUpForm from './DealerSignUpForm';

export const metadata: Metadata = {
  title: 'Dealer Sign Up',
  description:
    'Apply to become an authorized Alpha Munitions dealer. Fill out the form and a representative will reach out within 24-48 hours.',
};

export default function DealerSignUpPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/heroes/contact.jpg"
          alt="Precision shooting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-primary-500/25 z-10" />
        <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-primary-500/25 z-10" />
        <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-primary-500/25 z-10" />
        <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-primary-500/25 z-10" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-primary-500/70 uppercase mb-4">
            {'// Join Our Network //'}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Dealer Sign Up
          </h1>
          <div className="mx-auto mt-4 mb-6 h-[1px] w-[80px] bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />
          <p className="text-secondary-300 text-lg leading-relaxed">
            Fill out the form below, and a representative will reach out to you
            within 24-48 hours.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <DealerSignUpForm />
        </div>
      </main>
    </div>
  );
}
