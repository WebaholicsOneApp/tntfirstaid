interface CardBrandIconProps {
  brand: string;
  className?: string;
}

const KNOWN_BRANDS = new Set([
  "visa",
  "mastercard",
  "amex",
  "discover",
  "diners",
  "jcb",
]);

export default function CardBrandIcon({
  brand,
  className = "h-6",
}: CardBrandIconProps) {
  if (KNOWN_BRANDS.has(brand)) {
    return (
      <img
        src={`/images/payment/cards/${brand}.svg`}
        alt={brand}
        className={className}
      />
    );
  }

  // Generic card fallback
  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="48"
        height="32"
        rx="4"
        fill="#F7F7F7"
        stroke="#E5E5E5"
        strokeWidth="0.5"
      />
      <path
        d="M3 10h42M7 15h1m4 0h1m-7 4h34a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        stroke="#999"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
