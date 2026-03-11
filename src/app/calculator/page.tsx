import type { Metadata } from 'next';
import Image from 'next/image';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: "Kauber's Wind Constant Calculator",
  description:
    'Obtain wind constants for your specific caliber, projectile and velocity using the Wind Constant Calculator.',
};

export default function CalculatorPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/heroes/calculator.jpg"
          alt="Precision shooting in the field"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white">
            Kauber&apos;s Wind Constant Calculator
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left column — Instructions */}
            <div>
              <h2 className="text-xl font-display font-bold text-secondary-800 mb-4">
                Wind Constant Calculator Instruction
              </h2>

              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  The purpose of the Wind Constant Calculator is to provide a means to
                  obtain wind constants for your specific caliber, projectile and velocity
                  when you are using the formula:
                </p>

                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100 text-center">
                  <p className="text-secondary-800 font-bold text-sm">
                    Wind value (mph) x Yards in Hundreds &divide; Constant = MOA Correction
                  </p>
                </div>

                <p>
                  <span className="font-bold text-secondary-800">Example:</span>{' '}
                  6 Dasher, 105 Berger Hybrid Target @ 2950 fps. You estimate a 9 mph
                  left to right wind on a 600 yard target. Your wind constant for this
                  load at this range is 18.
                </p>

                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100 space-y-1">
                  <p className="text-secondary-800 font-bold text-center text-sm">
                    9 x 6 (600 yards) = 54 &divide; 18 = <span className="text-primary-600">3 MOA left or .9 Mils</span>
                  </p>
                </div>

                <p>
                  For those using Mils:{' '}
                  <span className="font-bold text-secondary-800">MOA correction x .3 = Mil correction</span>
                </p>

                <p>
                  Once the wind constant is obtained, it&apos;s good for any velocity wind.
                  Let&apos;s for example say the wind died down to 4 mph, same target.
                </p>

                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100">
                  <p className="text-secondary-800 font-bold text-center text-sm">
                    4 x 6 = 24 &divide; 18 = <span className="text-primary-600">1.3 MOA left or .4 Mils</span>
                  </p>
                </div>

                <p>
                  To learn more about using the Wind Constant Calculator and obtaining your
                  own wind constant, download the document below:
                </p>

                <a
                  href="/docs/Wind-Constant-Calculator-Instruction.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-900 text-white rounded-lg hover:bg-secondary-800 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-bold text-xs">Wind Constant Calculator Instruction (PDF)</span>
                </a>
              </div>
            </div>

            {/* Right column — Calculator */}
            <div>
              <CalculatorClient />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
