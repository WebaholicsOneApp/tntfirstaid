import Image from "next/image";
import Link from "next/link";

// EKG trace path — tiled so the wave scrolls seamlessly. animate-ekg-scroll
// translates by -1500 SVG units over 9.6s, so the beat pattern is generated
// with a 1500-unit period and repeated across enough tiles that the visible
// viewport (0–1200) is always covered through the full loop.
const EKG_TILE_WIDTH = 1500;
const EKG_TILE_COUNT = 3;
const EKG_BEAT_OFFSETS = [200, 500, 800, 1100, 1400];

const EKG_PATH = (() => {
  const beat = (cx: number) =>
    ` L ${cx - 40} 30` +
    ` L ${cx - 8} 30` +
    ` L ${cx - 3} 34` +
    ` L ${cx} 8` +
    ` L ${cx + 3} 52` +
    ` L ${cx + 8} 30` +
    ` L ${cx + 40} 30`;
  let d = "M 0 30";
  for (let t = 0; t < EKG_TILE_COUNT; t++) {
    for (const offset of EKG_BEAT_OFFSETS) {
      d += beat(offset + t * EKG_TILE_WIDTH);
    }
  }
  d += ` L ${EKG_TILE_WIDTH * EKG_TILE_COUNT} 30`;
  return d;
})();

const SIDE_BANNERS = {
  left: {
    src: "/images/old-site/banner-left-30off.jpg",
    alt: "Medical Supplies — 30% Off",
    href: "/shop",
  },
  right: {
    src: "/images/old-site/banner-right.jpg",
    alt: "Amazing Collection — Check Our Discounts",
    href: "/shop",
  },
};

export default function PromoBannersSection() {
  return (
    <section aria-label="Promotional banners" className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[108rem] px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
          <Link
            href={SIDE_BANNERS.left.href}
            className="group relative block aspect-[27/37] overflow-hidden rounded-xl md:col-span-1"
            aria-label={SIDE_BANNERS.left.alt}
          >
            <Image
              src={SIDE_BANNERS.left.src}
              alt={SIDE_BANNERS.left.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(min-width: 768px) 25vw, 100vw"
            />
          </Link>

          {/* Middle slot — Training spotlight */}
          <Link
            href="/services"
            aria-label="Get CPR-Certified — Book a hands-on training class"
            className="group bg-secondary-950 relative block aspect-[57/37] overflow-hidden rounded-2xl shadow-[0_18px_50px_-12px_rgba(227,24,55,0.35)] md:col-span-2"
          >
            <Image
              src="/images/hero/hero-cpr-training.jpg"
              alt=""
              fill
              className="scale-[1.06] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.12]"
              style={{ objectPosition: "center 38%" }}
              sizes="(min-width: 768px) 50vw, 100vw"
            />

            {/* ECG paper grid — subtle, brand-tinted, anchored to right side */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(227,24,55,0.45) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(227,24,55,0.45) 1px, transparent 1px)
                `,
                backgroundSize: "84px 84px",
                maskImage:
                  "linear-gradient(95deg, transparent 35%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.5) 100%)",
                WebkitMaskImage:
                  "linear-gradient(95deg, transparent 35%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.5) 100%)",
              }}
            />

            {/* Editorial dark mask — heavier on the left for type readability */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(102deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.86) 38%, rgba(8,8,10,0.42) 62%, rgba(8,8,10,0.08) 85%, transparent 100%)",
              }}
            />

            {/* Bottom-right red glow that intensifies on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse at 92% 100%, rgba(227,24,55,0.45) 0%, transparent 55%)",
              }}
            />

            {/* AHA Authorized stamp — corner credential */}
            <div
              aria-hidden
              className="absolute top-5 right-5 z-10 hidden sm:top-6 sm:right-6 sm:block md:top-8 md:right-8"
            >
              <div className="border-primary-500/70 bg-secondary-950/55 flex h-20 w-20 -rotate-[10deg] flex-col items-center justify-center rounded-full border-2 backdrop-blur-sm md:h-24 md:w-24">
                <div className="text-primary-300 font-display text-[0.7rem] leading-none font-bold tracking-[0.18em] md:text-[0.75rem]">
                  AHA
                </div>
                <div className="bg-primary-500 my-1 h-px w-7 md:my-1.5 md:w-8" />
                <div className="font-mono text-[0.45rem] leading-none font-semibold tracking-[0.22em] text-white uppercase md:text-[0.5rem]">
                  Authorized
                </div>
                <div className="text-primary-400 mt-1 font-mono text-[0.4rem] leading-none tracking-[0.25em] uppercase md:text-[0.45rem]">
                  Provider
                </div>
              </div>
            </div>

            {/* Animated ECG trace at the bottom edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-hidden sm:h-14"
            >
              <svg
                className="h-full w-full"
                viewBox="0 0 1200 60"
                preserveAspectRatio="none"
              >
                <g className="animate-ekg-scroll">
                  <path
                    d={EKG_PATH}
                    fill="none"
                    stroke="rgba(227,24,55,0.7)"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="animate-ekg-pulse"
                  />
                </g>
              </svg>
            </div>

            {/* Content */}
            <div className="relative flex h-full flex-col justify-center p-6 sm:p-10 md:p-14">
              <div className="max-w-md md:max-w-xl">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <div className="bg-primary-500 h-px w-8 md:w-10" />
                  <span className="text-primary-300 font-mono text-[0.6rem] font-semibold tracking-[0.3em] uppercase md:text-[0.7rem]">
                    Hands-On Training
                  </span>
                </div>

                <h3
                  className="font-display text-3xl leading-[0.95] font-bold text-white sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem]"
                  style={{ textShadow: "0 6px 28px rgba(0,0,0,0.65)" }}
                >
                  Get{" "}
                  <span className="text-primary-500 italic">
                    CPR-Certified.
                  </span>
                </h3>

                <p
                  className="text-secondary-300 mt-5 hidden max-w-md text-sm leading-relaxed sm:block md:text-base"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.65)" }}
                >
                  Real instructors. Real practice. AHA-recognized
                  certifications — at your facility or ours.
                </p>

                {/* Course chips */}
                <div className="mt-5 hidden flex-wrap gap-1.5 sm:flex md:mt-6 md:gap-2">
                  {[
                    "CPR / AED",
                    "STOP THE BLEED",
                    "OSHA",
                    "DISASTER MED",
                  ].map((c) => (
                    <span
                      key={c}
                      className="border-primary-500/40 bg-secondary-950/45 text-primary-200 rounded-full border px-2.5 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm md:px-3 md:py-1.5 md:text-[0.6rem]"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div className="mt-6 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-5">
                  <span className="bg-primary-500 group-hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold text-white uppercase shadow-[0_10px_36px_rgba(227,24,55,0.45)] transition-colors sm:px-7 sm:text-sm">
                    Book a Class
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </span>
                  <span className="text-secondary-400 hidden font-mono text-[0.6rem] tracking-[0.25em] uppercase sm:inline md:text-[0.65rem]">
                    or call{" "}
                    <span className="text-primary-300">800-868-4003</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href={SIDE_BANNERS.right.href}
            className="group relative block aspect-[27/37] overflow-hidden rounded-xl md:col-span-1"
            aria-label={SIDE_BANNERS.right.alt}
          >
            <Image
              src={SIDE_BANNERS.right.src}
              alt={SIDE_BANNERS.right.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(min-width: 768px) 25vw, 100vw"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
