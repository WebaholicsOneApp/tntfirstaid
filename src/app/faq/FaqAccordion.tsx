"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  questions: FaqItem[];
}

export default function FaqAccordion({ questions }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4">
      {questions.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all ${
              isOpen
                ? "border-primary-500/30 bg-primary-500/5 shadow-sm"
                : "border-secondary-100 bg-secondary-50 hover:border-secondary-200"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-start gap-4 p-6 text-left md:p-8"
              aria-expanded={isOpen}
            >
              <span
                className={`mt-0.5 flex-shrink-0 text-sm font-bold transition-colors ${
                  isOpen ? "text-primary-600" : "text-secondary-400"
                }`}
              >
                Q:
              </span>
              <span className="text-secondary-800 flex-1 text-lg font-bold">
                {faq.q}
              </span>
              <svg
                className={`text-secondary-400 mt-1 h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="animate-fade-in px-6 pb-6 pl-14 md:px-8 md:pb-8 md:pl-16">
                <p className="text-secondary-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
