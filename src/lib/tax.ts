/**
 * Nexus-based sales tax calculation.
 *
 * Alpha Munitions only has economic nexus in Utah (home state).
 * Add states here as a tax professional confirms additional nexus.
 */
export const NEXUS_TAX_RATES: Record<string, number> = {
  UT: 0.0775, // Utah — home state nexus
};

export function calculateTax(
  subtotalCents: number,
  shippingState?: string,
): number {
  if (!shippingState) return 0;
  const rate = NEXUS_TAX_RATES[shippingState.toUpperCase()] ?? 0;
  return Math.round(subtotalCents * rate);
}
