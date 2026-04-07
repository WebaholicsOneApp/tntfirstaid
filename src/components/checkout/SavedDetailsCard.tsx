interface Customer {
  firstName?: string;
  lastName?: string | null;
  email: string;
  phone?: string;
  defaultAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  } | null;
}

interface SavedDetailsCardProps {
  customer: Customer;
  isApplied: boolean;
  onApply: () => void;
  onClear: () => void;
}

export default function SavedDetailsCard({
  customer,
  isApplied,
  onApply,
  onClear,
}: SavedDetailsCardProps) {
  if (isApplied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-green-200/60 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium text-green-800">
            Saved details applied
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[0.65rem] tracking-[0.1em] text-green-700 uppercase transition-colors hover:text-green-900"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="border-primary-200/40 bg-primary-50/50 rounded-xl border p-4">
      <p className="text-secondary-400 mb-1 font-mono text-[0.55rem] tracking-[0.2em] uppercase">
        Saved Details
      </p>
      <p className="text-secondary-900 text-sm font-medium">
        {customer.firstName} {customer.lastName}
      </p>
      {customer.defaultAddress && (
        <p className="text-secondary-600 text-sm">
          {customer.defaultAddress.line1}, {customer.defaultAddress.city},{" "}
          {customer.defaultAddress.state} {customer.defaultAddress.postalCode}
        </p>
      )}
      <p className="text-secondary-500 text-sm">{customer.email}</p>
      <button
        type="button"
        onClick={onApply}
        className="bg-secondary-900 hover:bg-secondary-800 mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-[0.6rem] tracking-[0.15em] text-white uppercase transition-colors"
      >
        <span>Use saved details</span>
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </button>
    </div>
  );
}
