"use client";

import Link from "next/link";

interface CheckoutStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: "Shipping", href: "/checkout/shipping" },
  { number: 2, label: "Payment", href: "/checkout/payment" },
  { number: 3, label: "Review", href: "/checkout/confirm" },
] as const;

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function getDividerClass(stepIndex: number, currentStep: number): string {
  const leftStep = stepIndex + 1;
  const rightStep = stepIndex + 2;

  if (leftStep < currentStep && rightStep <= currentStep) {
    return "h-px w-12 bg-green-600";
  }
  if (leftStep < currentStep && rightStep === currentStep) {
    return "h-px w-12 bg-secondary-900";
  }
  if (leftStep === currentStep) {
    return "h-px w-12 bg-secondary-200";
  }
  return "h-px w-12 bg-secondary-200";
}

export default function CheckoutStepIndicator({
  currentStep,
}: CheckoutStepIndicatorProps) {
  return (
    <div className="mb-12 flex items-center justify-center gap-3">
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isFuture = step.number > currentStep;

        return (
          <div key={step.number} className="contents">
            {isCompleted && (
              <Link
                href={step.href}
                className="flex items-center gap-2 transition-opacity hover:opacity-70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 font-mono text-[0.6rem] text-white">
                  <CheckIcon />
                </span>
                <span className="text-secondary-400 font-mono text-[0.65rem] tracking-[0.2em] uppercase">
                  {step.label}
                </span>
              </Link>
            )}

            {isActive && (
              <div className="flex items-center gap-2">
                <span className="bg-secondary-900 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[0.6rem] text-white">
                  {step.number}
                </span>
                <span className="text-secondary-900 font-mono text-[0.65rem] font-medium tracking-[0.2em] uppercase">
                  {step.label}
                </span>
              </div>
            )}

            {isFuture && (
              <div className="flex items-center gap-2 opacity-40">
                <span className="bg-secondary-200 text-secondary-500 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[0.6rem]">
                  {step.number}
                </span>
                <span className="text-secondary-400 font-mono text-[0.65rem] tracking-[0.2em] uppercase">
                  {step.label}
                </span>
              </div>
            )}

            {index < STEPS.length - 1 && (
              <div className={getDividerClass(index, currentStep)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
