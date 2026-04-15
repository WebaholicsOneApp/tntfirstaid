/**
 * Popular search terms shared between client (SearchOverlay) and server (cache warming).
 * Keep this module dependency-free so it can be imported from both environments.
 */
export const POPULAR_SEARCHES = [
  "First Aid Kit",
  "AED",
  "Trauma Kit",
  "Bandages",
  "CPR Mask",
  "Tourniquet",
  "Burn Care",
  "Bloodborne Pathogen Kit",
] as const;

export type PopularSearch = (typeof POPULAR_SEARCHES)[number];
