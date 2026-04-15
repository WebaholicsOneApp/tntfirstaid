const CATEGORIES = [
  "FIRST AID KITS",
  "TRAUMA & BLEEDING CONTROL",
  "AED & DEFIBRILLATORS",
  "CPR TRAINING",
  "BURN CARE",
  "SPLINTS & IMMOBILIZATION",
  "BLOODBORNE PATHOGEN KITS",
  "PPE & PROTECTION",
  "BANDAGES & DRESSINGS",
  "WORKPLACE SAFETY",
];

const SEP = <span className="text-white/40 mx-6 select-none">+</span>;

export default function MarqueeBand() {
  const items = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  return (
    <div
      className="bg-primary-500 relative overflow-hidden py-3 select-none"
      aria-hidden="true"
    >
      <div className="animate-marquee-scroll flex whitespace-nowrap">
        {items.map((name, i) => (
          <span
            key={i}
            className="flex items-center font-mono text-[0.6rem] tracking-[0.3em] text-white uppercase"
          >
            {name}
            {SEP}
          </span>
        ))}
      </div>
    </div>
  );
}
