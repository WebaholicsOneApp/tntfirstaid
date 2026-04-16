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
      className="h-3.5 w-3.5"
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
    return "h-[2px] w-10 sm:w-16 rounded-full bg-green-600";
  }
  if (leftStep < currentStep && rightStep === currentStep) {
    return "h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-green-600 to-secondary-900";
  }
  return "h-[2px] w-10 sm:w-16 rounded-full bg-secondary-200";
}

export default function CheckoutStepIndicator({
  currentStep,
}: CheckoutStepIndicatorProps) {
  return (
    <div className="mb-12 flex items-center justify-center gap-3 sm:gap-4">
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isFuture = step.number > currentStep;

        return (
          <div key={step.number} className="contents">
            {isCompleted && (
              <Link
                href={step.href}
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white shadow-sm ring-2 ring-green-600/15 ring-offset-2 ring-offset-[#FAFAF8]">
                  <CheckIcon />
                </span>
                <span className="text-secondary-600 group-hover:text-secondary-800 text-sm font-medium transition-colors">
                  {step.label}
                </span>
              </Link>
            )}

            {isActive && (
              <div className="flex items-center gap-2.5">
                <span className="bg-secondary-900 ring-secondary-900/15 ring-offset-[#FAFAF8] flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-offset-2">
                  {step.number}
                </span>
                <span className="text-secondary-900 text-sm font-semibold">
                  {step.label}
                </span>
              </div>
            )}

            {isFuture && (
              <div className="flex items-center gap-2.5">
                <span className="border-secondary-200 text-secondary-400 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-sm font-medium">
                  {step.number}
                </span>
                <span className="text-secondary-400 hidden text-sm font-medium sm:inline">
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
