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
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <Image
          src="/images/heroes/contact.jpg"
          alt="Precision shooting"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-primary-400 uppercase">Join Our Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Dealer Sign Up</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg">Fill out the form below, and a representative will reach out to you within 24-48 hours.</p>
          </div>
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
