'use client';

import { useState, useCallback } from 'react';

interface Inputs {
  distance: string;
  windVelocity: string;
  softwareMoa: string;
  fieldConstant: string;
}

interface Results {
  trueConstant: number;
  trueWindDrift: number;
  fieldConstantDrift: number;
  deviation: number;
}

function compute(inputs: Inputs): Results | null {
  const distance = parseFloat(inputs.distance);
  const windVelocity = parseFloat(inputs.windVelocity);
  const softwareMoa = parseFloat(inputs.softwareMoa);
  const fieldConstant = parseFloat(inputs.fieldConstant);

  if (
    isNaN(distance) || isNaN(windVelocity) || isNaN(softwareMoa) ||
    distance <= 0 || windVelocity <= 0 || softwareMoa <= 0
  ) {
    return null;
  }

  const yardsInHundreds = distance / 100;
  const trueConstant = (windVelocity * yardsInHundreds) / softwareMoa;
  const trueWindDrift = softwareMoa * yardsInHundreds * 1.047;
  const fc = isNaN(fieldConstant) || fieldConstant <= 0 ? trueConstant : fieldConstant;
  const fieldMoaCorrection = (windVelocity * yardsInHundreds) / fc;
  const fieldConstantDrift = fieldMoaCorrection * yardsInHundreds * 1.047;
  const deviation = fieldConstantDrift - trueWindDrift;

  return {
    trueConstant: Math.round(trueConstant * 100) / 100,
    trueWindDrift: Math.round(trueWindDrift * 100) / 100,
    fieldConstantDrift: Math.round(fieldConstantDrift * 100) / 100,
    deviation: Math.round(deviation * 100) / 100,
  };
}

function InputField({ name, value, onChange, placeholder }: {
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string;
}) {
  return (
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      step="any"
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white border border-primary-300 rounded-lg text-sm text-center focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
    />
  );
}

function OutputField({ value }: { value: string | number }) {
  return (
    <div className="w-full px-4 py-2.5 bg-primary-500/15 border border-primary-300 rounded-lg text-sm text-center text-secondary-700 font-medium min-h-[40px]">
      {value}
    </div>
  );
}

export default function CalculatorClient() {
  const [inputs, setInputs] = useState<Inputs>({
    distance: '',
    windVelocity: '',
    softwareMoa: '',
    fieldConstant: '',
  });

  const results = compute(inputs);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, []);

  const rows: { label: string; hint: string; content: React.ReactNode }[] = [
    { label: 'Distance (Yards)', hint: 'Enter yards in 100 yard increments', content: <InputField name="distance" value={inputs.distance} onChange={handleChange} placeholder="200" /> },
    { label: 'Wind Velocity (MPH)', hint: 'Enter wind velocity', content: <InputField name="windVelocity" value={inputs.windVelocity} onChange={handleChange} placeholder="10" /> },
    { label: 'Software Produced MOA Correction', hint: 'Ballistic app MOA correction for above wind', content: <InputField name="softwareMoa" value={inputs.softwareMoa} onChange={handleChange} placeholder="1.1" /> },
    { label: 'True Constant', hint: 'Will auto-populate', content: <OutputField value={results?.trueConstant ?? ''} /> },
    { label: 'True Wind Drift (Inches)', hint: 'Will auto-populate', content: <OutputField value={results?.trueWindDrift ?? ''} /> },
    { label: 'Field Constant', hint: 'Adjust to meet your wind drift deviation limit', content: <InputField name="fieldConstant" value={inputs.fieldConstant} onChange={handleChange} placeholder={results ? String(Math.round(results.trueConstant)) : '18'} /> },
    { label: 'Field Constant Produced Wind Drift (Inches)', hint: 'Will auto-populate', content: <OutputField value={results?.fieldConstantDrift ?? ''} /> },
    { label: 'Deviation From True Wind Drift', hint: 'Will auto-populate', content: <OutputField value={results?.deviation ?? ''} /> },
  ];

  return (
    <div>
      <div className="bg-primary-500 rounded-t-xl px-5 py-3 text-center">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-900">
          Type In Your Metrics Below
        </h2>
      </div>

      <div className="bg-primary-500/20 px-5 py-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <label className="block text-[10px] font-bold text-secondary-600 uppercase tracking-[0.12em] text-center mb-1.5">
              {row.label}
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1">{row.content}</div>
              <span className="text-[10px] text-gray-400 leading-tight w-32 pt-2.5 hidden xl:block">
                {row.hint}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary-500 rounded-b-xl px-5 py-2.5" />
    </div>
  );
}
