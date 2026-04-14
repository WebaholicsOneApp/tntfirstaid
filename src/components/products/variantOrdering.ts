/**
 * Static dropdown ordering to match alphamunitions.com (WooCommerce).
 *
 * Keyed by variantType label (case-insensitive lookup).
 * Options not listed here will be appended at the end in their original order.
 *
 * To update: edit the arrays below to match the WooCommerce attribute term order.
 */

const VARIANT_ORDER: Record<string, string[]> = {
  // ── Alpha Legacy Reamer + Roughers ──
  Cartridge: [
    "223 Wylde",
    "223 Rem",
    "204 Ruger",
    "22-250",
    "22LR Match",
    "22 Creedmoor",
    "22 Dasher",
    "22 ARC",
    "22 GT",
    "25 PRC",
    "25x47",
    "25 Creedmoor",
    "25 GT",
    "6 PRC",
    "6 Creedmoor",
    "6 BR",
    "6mm PPC",
    "6 ARC",
    "6 BRA",
    "6 Dasher",
    "6mm GT",
    "6x47",
    "6XC II",
    "243 Win",
    ".260 REM",
    "6.5 Creedmoor",
    "6.5 Grendel",
    "6.5 PRC",
    "6.5x47",
    "6.8x51",
    "277 Wolverine",
    "6.8 Western",
    "7 PRC",
    "7-300 PRC",
    "7 Back Country",
    "7mm SAW",
    "7mm-08",
    "7 Rem Mag",
    "280 AI",
    "28 Nosler",
    "300 Win Mag",
    "7.62x51 NATO",
    ".308 Win",
    "300 BLK",
    ".300 Norma Mag",
    "30-06",
    "300 PRC",
    "300 WSM",
    "338 ARC",
    "338 Lapua Mag",
    "8.6 Blackout",
  ],

  // ── Alpha Legacy Reamer (second dropdown) ──
  Freebore: [
    ".060",
    ".090",
    ".091",
    ".096",
    ".104",
    ".115",
    ".120",
    ".125",
    ".130",
    ".145",
    ".148",
    ".150",
    ".154",
    ".155",
    ".160",
    ".169",
    ".170",
    ".175",
    ".180",
    ".183",
    ".185",
    ".187",
    ".199",
    ".233",
    ".354",
    ".030",
    ".040",
    ".062",
    ".081",
    ".085",
    ".088",
    ".100",
    ".105",
    ".114",
    ".118",
    ".131",
    ".135",
    ".174",
    ".188",
    ".190",
    ".195",
    ".220",
    ".230",
    ".232",
    "NATO",
  ],

  // ── Chamber Gauge + .004″ / Chamber Go Gauge ──
  "Chamber Gauges": [
    "308 Winchester Family",
    "6.5 PRC Family",
    "7 PRC Family",
    "Creedmoor Family",
    "Dasher Family",
    "GT Family",
    "x47 Family",
  ],

  // ── Muzzle Crown Tool + Pilot Bushing (combined) ──
  Caliber: [
    "22cal/6mm",
    "25cal/6mm/7mm",
    "30cal/338cal",
    "22 Cal",
    "25 Cal",
    "6mm",
    "6.5mm",
    "7mm",
    "30 Cal",
  ],

  // ── Predrill - Carbide ──
  "Drill Dimension": [
    '0.31" x 3.75"',
    '0.36" x 3.5"',
    '0.41" x 3.50"',
    '.041" x 4.25"',
    '0.47" x 4.25"',
    '0.50" x 4.25"',
  ],
};

// Build a case-insensitive lookup
const orderLookup = new Map<string, Map<string, number>>();
for (const [type, values] of Object.entries(VARIANT_ORDER)) {
  const indexMap = new Map<string, number>();
  values.forEach((v, i) => indexMap.set(v, i));
  orderLookup.set(type.toLowerCase(), indexMap);
}

/**
 * Sort an array of option strings to match the WooCommerce dropdown order.
 * Unknown options are appended at the end in their original order.
 */
export function sortVariantOptions(
  variantType: string,
  options: string[],
): string[] {
  const indexMap = orderLookup.get(variantType.toLowerCase());
  if (!indexMap) return options;

  const known: string[] = [];
  const unknown: string[] = [];

  for (const opt of options) {
    if (indexMap.has(opt)) {
      known.push(opt);
    } else {
      unknown.push(opt);
    }
  }

  known.sort((a, b) => (indexMap.get(a) ?? 0) - (indexMap.get(b) ?? 0));

  return [...known, ...unknown];
}
