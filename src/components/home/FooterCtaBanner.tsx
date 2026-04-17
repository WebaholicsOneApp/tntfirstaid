import Image from "next/image";
import Link from "next/link";

const badges = [
  { label: "Certified Instructors" },
  { label: "OSHA Compliant" },
  { label: "Fast Shipping" },
];

export default function FooterCtaBanner() {
  return (
    <section className="bg-secondary-950 relative overflow-hidden">
      <Image
        src="/images/old-site/hero-main.jpg"
        alt=""
        fill
        className="object-contain opacity-30"
        sizes="100vw"
      />
      {/* Dark overlay for text readability */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.7) 100%)",
        }}
      />

      <div className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="bg-primary-500/60 h-px w-6 shrink-0" />
            <span className="text-primary-400 text-sm font-semibold tracking-wide uppercase">
              Stay Ready
            </span>
            <div className="bg-primary-500/60 h-px w-6 shrink-0" />
          </div>

          <h2 className="font-display text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
            Equip Your Team.
            <br />
            <span className="text-primary-500">Train Your People.</span>
          </h2>

          <p className="mt-10 mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {badges.map((b, i) => (
              <span key={b.label} className="flex items-center gap-5">
                <span className="text-secondary-200 text-sm font-medium">
                  {b.label}
                </span>
                {i < badges.length - 1 && (
                  <span className="bg-primary-500/40 h-3 w-px" />
                )}
              </span>
            ))}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="group bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98]"
            >
              Shop Now
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="border-primary-500/60 text-primary-300 hover:border-primary-500 hover:bg-primary-500/10 hover:text-white inline-flex items-center rounded-full border px-7 py-3 text-sm font-semibold uppercase transition-colors active:scale-[0.98]"
            >
              Book Training
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
