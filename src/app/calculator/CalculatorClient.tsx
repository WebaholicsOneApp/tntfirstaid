'use client';

import { useState } from 'react';

interface CalculatorInputs {
  windSpeed: string;
  distance: string;
  bulletWeight: string;
  ballisticCoefficient: string;
}

interface CalculatorResult {
  driftInches: number;
  driftMoa: number;
}

/**
 * Simplified crosswind drift estimation.
 *
 * Uses the approximation:
 *   Drift (inches) = WindSpeed * Range^2 / (BC * BulletWeight * K)
 *
 * where K is a constant tuned to produce reasonable results for typical
 * rifle cartridges. This is a rough estimation -- real drift depends on
 * muzzle velocity, drag model, altitude, temperature, and many other factors.
 *
 * MOA conversion: MOA = (Drift / Range_yards) * (100 / 1.047)
 */
function calculateWindDrift(
  windSpeed: number,
  distanceYards: number,
  bulletWeight: number,
  bc: number,
): CalculatorResult {
  // Tuning constant to produce reasonable values for common rifle loads
  const K = 4800;

  const driftInches =
    (windSpeed * distanceYards * distanceYards) / (bc * bulletWeight * K);

  // Convert to MOA: 1 MOA ~ 1.047 inches per 100 yards
  const driftMoa = driftInches / ((distanceYards / 100) * 1.047);

  return {
    driftInches: Math.round(driftInches * 100) / 100,
    driftMoa: Math.round(driftMoa * 100) / 100,
  };
}

export default function CalculatorClient() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    windSpeed: '',
    distance: '',
    bulletWeight: '',
    ballisticCoefficient: '',
  });
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setResult(null);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const windSpeed = parseFloat(inputs.windSpeed);
    const distance = parseFloat(inputs.distance);
    const bulletWeight = parseFloat(inputs.bulletWeight);
    const bc = parseFloat(inputs.ballisticCoefficient);

    if (
      isNaN(windSpeed) ||
      isNaN(distance) ||
      isNaN(bulletWeight) ||
      isNaN(bc) ||
      windSpeed <= 0 ||
      distance <= 0 ||
      bulletWeight <= 0 ||
      bc <= 0
    ) {
      return;
    }

    setResult(calculateWindDrift(windSpeed, distance, bulletWeight, bc));
  };

  const isValid =
    inputs.windSpeed &&
    inputs.distance &&
    inputs.bulletWeight &&
    inputs.ballisticCoefficient;

  return (
    <div>
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Wind Speed */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Wind Speed (mph)
            </label>
            <input
              type="number"
              name="windSpeed"
              value={inputs.windSpeed}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="10"
              className="w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
            />
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Distance (yards)
            </label>
            <input
              type="number"
              name="distance"
              value={inputs.distance}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="1000"
              className="w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
            />
          </div>

          {/* Bullet Weight */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Bullet Weight (grains)
            </label>
            <input
              type="number"
              name="bulletWeight"
              value={inputs.bulletWeight}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="140"
              className="w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
            />
          </div>

          {/* Ballistic Coefficient */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Ballistic Coefficient (G7)
            </label>
            <input
              type="number"
              name="ballisticCoefficient"
              value={inputs.ballisticCoefficient}
              onChange={handleChange}
              min="0"
              step="0.001"
              placeholder="0.310"
              className="w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-colors text-sm uppercase tracking-widest shadow-lg shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Calculate Wind Deflection
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 bg-secondary-900 rounded-2xl p-8 text-center animate-fade-in">
          <p className="text-secondary-400 text-xs uppercase tracking-widest mb-6">
            Estimated Crosswind Deflection
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-4xl font-display font-bold text-primary-500 mb-1">
                {result.driftInches}&#8243;
              </p>
              <p className="text-secondary-400 text-sm">Inches</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-white mb-1">
                {result.driftMoa}
              </p>
              <p className="text-secondary-400 text-sm">MOA</p>
            </div>
          </div>
          <p className="text-secondary-500 text-xs mt-6">
            Based on a simplified crosswind drift model. Use as an estimation
            only.
          </p>
        </div>
      )}
    </div>
  );
}
