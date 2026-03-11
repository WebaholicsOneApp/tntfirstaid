import type { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: "Kauber's Wind Constant Calculator",
  description:
    'Estimate crosswind deflection for your load using wind speed, distance, bullet weight, and ballistic coefficient.',
};

export default function CalculatorPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="bg-secondary-900 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Ballistics Tool
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Kauber&apos;s Wind Constant Calculator
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            Quickly estimate crosswind deflection based on wind speed, distance,
            bullet weight, and ballistic coefficient. A useful starting point
            for wind calls in the field.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <CalculatorClient />

          {/* Disclaimer */}
          <div className="mt-10 bg-secondary-50 rounded-xl p-6 border border-secondary-100">
            <h3 className="font-bold text-secondary-800 text-sm mb-2">
              Disclaimer
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              This calculator provides a simplified approximation of crosswind
              deflection. Actual bullet drift depends on many additional
              factors including altitude, temperature, humidity, exact bullet
              profile, muzzle velocity, and wind angle. Always confirm your
              wind calls with real-world testing. This tool is intended for
              educational and estimation purposes only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
