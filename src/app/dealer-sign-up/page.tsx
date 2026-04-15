import type { Metadata } from "next";
import Image from "next/image";
import DealerSignUpForm from "./DealerSignUpForm";

export const metadata: Metadata = {
  title: "Dealer Sign Up",
  description:
    "Apply to become an authorized TNT First Aid dealer. Fill out the form and a representative will reach out within 24-48 hours.",
};

export default function DealerSignUpPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/heroes/contact.jpg"
          alt="Precision shooting"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Join Our Network
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              Dealer Sign Up
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/60">
              Fill out the form below, and a representative will reach out to
              you within 24-48 hours.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <DealerSignUpForm />
        </div>
      </main>
    </div>
  );
}
