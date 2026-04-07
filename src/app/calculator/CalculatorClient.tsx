"use client";

import { useState, useCallback } from "react";

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
    isNaN(distance) ||
    isNaN(windVelocity) ||
    isNaN(softwareMoa) ||
    distance <= 0 ||
    windVelocity <= 0 ||
    softwareMoa <= 0
  ) {
    return null;
  }

  const yardsInHundreds = distance / 100;
  const trueConstant = (windVelocity * yardsInHundreds) / softwareMoa;
  const trueWindDrift = softwareMoa * yardsInHundreds * 1.047;
  const fc =
    isNaN(fieldConstant) || fieldConstant <= 0 ? trueConstant : fieldConstant;
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

function InputField({
  name,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border-primary-300 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-4 py-2.5 text-center text-sm focus:ring-1 focus:outline-none"
    />
  );
}

function OutputField({ value }: { value: string | number }) {
  return (
    <div className="bg-primary-500/15 border-primary-300 text-secondary-700 min-h-[40px] w-full rounded-lg border px-4 py-2.5 text-center text-sm font-medium">
      {value}
    </div>
  );
}

interface Row {
  label: string;
  hint: string;
  required: boolean;
  isInput: boolean;
  content: React.ReactNode;
}

export default function CalculatorClient() {
  const [inputs, setInputs] = useState<Inputs>({
    distance: "",
    windVelocity: "",
    softwareMoa: "",
    fieldConstant: "",
  });

  const results = compute(inputs);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs({
      distance: "",
      windVelocity: "",
      softwareMoa: "",
      fieldConstant: "",
    });
  }, []);

  const inputRows: Row[] = [
    {
      label: "Distance (Yards)",
      hint: "Enter yards in 100 yard increments",
      required: true,
      isInput: true,
      content: (
        <InputField
          name="distance"
          value={inputs.distance}
          onChange={handleChange}
          placeholder="ex: 600"
        />
      ),
    },
    {
      label: "Wind Velocity (MPH)",
      hint: "Enter wind velocity",
      required: true,
      isInput: true,
      content: (
        <InputField
          name="windVelocity"
          value={inputs.windVelocity}
          onChange={handleChange}
          placeholder="ex: 9"
        />
      ),
    },
    {
      label: "Software Produced MOA Correction",
      hint: "Ballistic app MOA correction for above wind",
      required: true,
      isInput: true,
      content: (
        <InputField
          name="softwareMoa"
          value={inputs.softwareMoa}
          onChange={handleChange}
          placeholder="ex: 3.0"
        />
      ),
    },
  ];

  const resultRows: Row[] = [
    {
      label: "True Constant",
      hint: "Will auto-populate",
      required: false,
      isInput: false,
      content: <OutputField value={results?.trueConstant ?? ""} />,
    },
    {
      label: "True Wind Drift (Inches)",
      hint: "Will auto-populate",
      required: false,
      isInput: false,
      content: <OutputField value={results?.trueWindDrift ?? ""} />,
    },
    {
      label: "Field Constant",
      hint: "Adjust to meet your wind drift deviation limit",
      required: false,
      isInput: true,
      content: (
        <InputField
          name="fieldConstant"
          value={inputs.fieldConstant}
          onChange={handleChange}
          placeholder={
            results ? `ex: ${Math.round(results.trueConstant)}` : "ex: 18"
          }
        />
      ),
    },
    {
      label: "Field Constant Produced Wind Drift (Inches)",
      hint: "Will auto-populate",
      required: false,
      isInput: false,
      content: <OutputField value={results?.fieldConstantDrift ?? ""} />,
    },
    {
      label: "Deviation From True Wind Drift",
      hint: "Will auto-populate",
      required: false,
      isInput: false,
      content: <OutputField value={results?.deviation ?? ""} />,
    },
  ];

  function renderRow(row: Row) {
    return (
      <div
        key={row.label}
        className={row.isInput ? "border-l-primary-500 border-l-2 pl-3" : ""}
      >
        <label className="text-secondary-600 mb-1.5 block text-center text-[10px] font-bold tracking-[0.12em] uppercase">
          {row.label}
          {row.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <div>{row.content}</div>
        <p className="mt-1 text-center text-[10px] text-gray-400">{row.hint}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary-500 rounded-t-xl px-5 py-3 text-center">
        <h2 className="text-secondary-900 text-xs font-bold tracking-[0.2em] uppercase">
          Type In Your Metrics Below
        </h2>
      </div>

      <div className="bg-primary-500/20 space-y-3 px-5 py-4">
        {/* YOUR INPUTS section */}
        <div className="text-secondary-500 text-center text-[10px] font-bold tracking-[0.2em] uppercase">
          Your Inputs
        </div>

        {inputRows.map(renderRow)}

        {/* RESULTS section */}
        <div className="border-primary-300 text-secondary-500 border-t pt-3 text-center text-[10px] font-bold tracking-[0.2em] uppercase">
          Results
        </div>

        <div className="grid grid-cols-2 gap-3">
          {resultRows.slice(0, 4).map(renderRow)}
        </div>
        {/* Deviation — full width */}
        {resultRows[4] && renderRow(resultRows[4])}

        {/* Reset button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleReset}
            className="border-secondary-400 text-secondary-600 hover:bg-secondary-100 rounded-lg border px-6 py-2 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-primary-500 rounded-b-xl px-5 py-2.5" />
    </div>
  );
}
