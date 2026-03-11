/**
 * Popular search terms shared between client (SearchOverlay) and server (cache warming).
 * Keep this module dependency-free so it can be imported from both environments.
 */
export const POPULAR_SEARCHES = [
  '6.5 Creedmoor',
  '308 Winchester',
  '223 Remington',
  '300 Win Mag',
  'Brass',
  'Reloading Dies',
  'Bullets',
  'Primers',
] as const;

export type PopularSearch = (typeof POPULAR_SEARCHES)[number];
