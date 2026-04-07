import type { Metadata } from "next";
import Image from "next/image";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Kauber's Wind Constant Calculator",
  description:
    "Obtain wind constants for your specific caliber, projectile and velocity using the Wind Constant Calculator.",
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/heroes/calculator.jpg"
          alt="Precision shooting in the field"
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
                Ballistics Tool
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
              Kauber&apos;s Wind Constant Calculator
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left column — Instructions */}
            <div className="lg:sticky lg:top-8">
              <h2 className="font-display text-secondary-900 mb-4 text-xl font-bold">
                Wind Constant Calculator Instruction
              </h2>

              <div className="text-secondary-600 space-y-3 text-sm leading-relaxed">
                <p>
                  The purpose of the Wind Constant Calculator is to provide a
                  means to obtain wind constants for your specific caliber,
                  projectile and velocity when you are using the formula:
                </p>

                <div className="bg-secondary-50 border-secondary-100 rounded-lg border p-3 text-center">
                  <p className="text-secondary-800 text-sm font-bold">
                    Wind value (mph) x Yards in Hundreds &divide; Constant = MOA
                    Correction
                  </p>
                </div>

                <p>
                  <span className="text-secondary-800 font-bold">Example:</span>{" "}
                  6 Dasher, 105 Berger Hybrid Target @ 2950 fps. You estimate a
                  9 mph left to right wind on a 600 yard target. Your wind
                  constant for this load at this range is 18.
                </p>

                <div className="bg-secondary-50 border-secondary-100 space-y-1 rounded-lg border p-3">
                  <p className="text-secondary-800 text-center text-sm font-bold">
                    9 x 6 (600 yards) = 54 &divide; 18 ={" "}
                    <span className="text-primary-600">
                      3 MOA left or .9 Mils
                    </span>
                  </p>
                </div>

                <p>
                  For those using Mils:{" "}
                  <span className="text-secondary-800 font-bold">
                    MOA correction x .3 = Mil correction
                  </span>
                </p>

                <p>
                  Once the wind constant is obtained, it&apos;s good for any
                  velocity wind. Let&apos;s for example say the wind died down
                  to 4 mph, same target.
                </p>

                <div className="bg-secondary-50 border-secondary-100 rounded-lg border p-3">
                  <p className="text-secondary-800 text-center text-sm font-bold">
                    4 x 6 = 24 &divide; 18 ={" "}
                    <span className="text-primary-600">
                      1.3 MOA left or .4 Mils
                    </span>
                  </p>
                </div>

                <p>
                  To learn more about using the Wind Constant Calculator and
                  obtaining your own wind constant, download the document below:
                </p>

                <a
                  href="/docs/Wind-Constant-Calculator-Instruction.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Wind Constant Calculator (PDF)
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
