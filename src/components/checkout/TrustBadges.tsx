"use client";

import type { ReactNode } from "react";

interface Badge {
  title: string;
  desc: string;
  icon: ReactNode;
}

const BADGES: Badge[] = [
  {
    title: "Secure Checkout",
    desc: "256-bit SSL · PCI-compliant tokenization",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-2.25 0h13.5A2.25 2.25 0 0121 12.75v6.75A2.25 2.25 0 0118.75 21.75H5.25A2.25 2.25 0 013 19.5v-6.75A2.25 2.25 0 015.25 10.5z"
        />
      </svg>
    ),
  },
  {
    title: "30-Day Guarantee",
    desc: "Not satisfied? Send it back, no questions",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
  },
  {
    title: "Founded by Medical Professionals",
    desc: "Family-owned since 2011 in Kaysville, Utah",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    title: "Ships Same Day",
    desc: "Order by 2 PM MT for same-day shipping",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18.75 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4.5h11.25v10.5H3V4.5zm11.25 4.5h3.621a1.5 1.5 0 011.06.44l1.879 1.878a1.5 1.5 0 01.44 1.061V15h-7V9z"
        />
      </svg>
    ),
  },
];

export default function TrustBadges() {
  return (
    <div className="ring-secondary-100 rounded-2xl bg-white p-5 shadow-sm ring-1 sm:p-6">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
            Why TNT
          </span>
        </div>
        <ul className="space-y-3">
          {BADGES.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <div className="bg-primary-500/10 text-primary-500 ring-primary-500/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1">
                {b.icon}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-secondary-900 text-sm leading-tight font-semibold">
                  {b.title}
                </p>
                <p className="text-secondary-500 mt-0.5 text-xs leading-snug">
                  {b.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Accepted payments */}
        <div className="border-secondary-100 mt-5 border-t pt-4">
          <p className="text-secondary-500 mb-2.5 text-center text-xs font-medium">
            We Accept
          </p>
          <div className="flex items-center justify-center gap-2">
            {["Visa", "Mastercard", "Amex", "Discover"].map((brand) => (
              <span
                key={brand}
                className="border-secondary-200 text-secondary-600 inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[0.7rem] font-semibold"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
