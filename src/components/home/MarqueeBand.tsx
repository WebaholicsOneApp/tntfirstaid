const CALIBERS = [
  "204 RUGER",
  "6.5 CREEDMOOR",
  ".308 WINCHESTER",
  "6MM ARC",
  "7MM-08 REMINGTON",
  "25 GT",
  "6.5 GRENDEL",
  "8.6 BLK",
  "6MM PPC",
  ".260 REMINGTON",
];

const SEP = <span className="text-secondary-950/30 mx-6 select-none">·</span>;

export default function MarqueeBand() {
  // Triple items for seamless loop: animate translateX(-33.333%) = 1 complete cycle
  const items = [...CALIBERS, ...CALIBERS, ...CALIBERS];

  return (
    <div
      className="bg-primary-500 relative overflow-hidden py-3 select-none"
      aria-hidden="true"
    >
      <div className="animate-marquee-scroll flex whitespace-nowrap">
        {items.map((name, i) => (
          <span
            key={i}
            className="text-secondary-950 flex items-center font-mono text-[0.6rem] tracking-[0.3em] uppercase"
          >
            {name}
            {SEP}
          </span>
        ))}
      </div>
    </div>
  );
}
