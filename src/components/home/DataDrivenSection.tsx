import Image from "next/image";

const stats = [
  { value: "2011", label: "Founded" },
  { value: "10k+", label: "People Trained" },
  { value: "100%", label: "OSHA Aligned" },
];

export default function DataDrivenSection() {
  return (
    <section className="bg-white py-16 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-20">
          {/* Left: brand panel */}
          <div className="ring-secondary-100 bg-secondary-950 relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-lg ring-1 lg:aspect-auto lg:h-full">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 30%, rgba(227,24,55,0.28) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(227,24,55,0.15) 0%, transparent 55%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent 0, transparent 39px, #ffffff 39px, #ffffff 40px),
                  repeating-linear-gradient(90deg, transparent 0, transparent 39px, #ffffff 39px, #ffffff 40px)
                `,
              }}
            />
            <div className="relative flex h-full items-center justify-center p-10">
              <Image
                src="/images/tnt-logo.png"
                alt="TNT First Aid"
                width={320}
                height={320}
                className="h-auto w-[180px] drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:w-[240px] md:w-[280px]"
              />
            </div>
          </div>

          {/* Right: content */}
          <div className="w-full">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6 shrink-0" />
              <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                Proven Track Record
              </span>
            </div>

            <h2 className="font-display text-secondary-900 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Training &amp; Supply You Can Count On
            </h2>

            <div className="from-primary-500 mt-5 h-px w-14 bg-gradient-to-r to-transparent" />

            <div className="mt-8 mb-8 grid grid-cols-3">
              {stats.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`pr-6 ${i > 0 ? "border-secondary-100 border-l pl-6" : ""}`}
                >
                  <div className="bg-primary-500 mb-4 h-[2px] w-8" />
                  <p className="font-display text-secondary-900 text-3xl leading-none font-bold tabular-nums sm:text-4xl lg:text-5xl">
                    {value}
                  </p>
                  <p className="text-secondary-600 mt-2.5 text-xs font-medium tracking-wide uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-secondary-700 space-y-4 text-base leading-relaxed">
              <p>
                TNT First Aid has been equipping workplaces, schools, and
                families with life-saving supplies and training since 2011.
                Every kit we ship and every class we teach is built around the
                same goal: making sure the right tools are on hand &mdash; and
                that the people using them know how.
              </p>
              <p>
                Whether you need a 25-person OSHA-compliant workplace kit, an
                AED for your office, or on-site Stop the Bleed training for
                your team, we&rsquo;ll help you build the right solution and
                keep it ready for the day you hope never comes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
