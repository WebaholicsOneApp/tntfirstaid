import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trauma Kit vs. First-Aid Kit",
  description:
    "How trauma kits and first-aid kits actually differ — what each one covers, and how to decide which you need.",
};

const injuryTypes = [
  "Major Bleeding",
  "Minor Bleeding",
  "Airway problems",
  "Sprains, Strains and Fractures",
  "Eye Injuries",
  "Comfort and Care",
  "First-Aid, small injuries",
];

const treatmentItems = [
  "RATS Tourniquet, Quick Clot",
  "Wound Seal, Antiseptic, Non-adherent pads, Coban",
  "Chest Seal, CPR pocket mask, Airways",
  "Fracture Fork, Instant Ice Wraps, Stat Splint",
  "Foreign Object Removal Kit, Eye Cups, 2 types of eye wash",
  "Ice Packs, Electrolytes, Bandaging, Slings, Splinter Tools",
  "Assortment of Band-aids, Cleaning Products, Antiseptics, Sting Swabs",
];

export default function TraumaKitVsFirstAidKitPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(227,24,55,0.25) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(227,24,55,0.15) 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Learn
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Trauma Kit vs. First-Aid Kit
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-20">
        <article className="mx-auto max-w-3xl">
          <div className="text-secondary-700 space-y-5 text-base leading-relaxed md:text-lg">
            <p>
              Do you need a trauma kit or a first-aid kit? It&rsquo;s one of
              the most common questions we get — and the answer isn&rsquo;t
              the same for everyone. Here&rsquo;s how to think about it.
            </p>
          </div>

          {/* Triage categories */}
          <section className="my-14">
            <p className="text-secondary-700 mb-6 text-base leading-relaxed md:text-lg">
              To understand why both kits exist, it helps to think the way
              emergency responders do. Injuries are triaged into three
              categories based on how urgently they need care:
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase text-red-700">
                    Red
                  </span>
                </div>
                <h3 className="font-display text-secondary-900 mb-2 text-lg font-bold">
                  Immediate Life-Threatening
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  Patients will die without immediate intervention.
                </p>
              </div>
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase text-yellow-700">
                    Yellow
                  </span>
                </div>
                <h3 className="font-display text-secondary-900 mb-2 text-lg font-bold">
                  Intermediate
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  Not life-threatening at first, but will become so if left
                  untreated.
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase text-green-700">
                    Green
                  </span>
                </div>
                <h3 className="font-display text-secondary-900 mb-2 text-lg font-bold">
                  Walking Wounded
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  Common everyday injuries that still need attention.
                </p>
              </div>
            </div>
          </section>

          <div className="text-secondary-700 space-y-5 text-base leading-relaxed md:text-lg">
            <p>
              A properly built trauma kit covers everything a first-aid kit
              does — plus the gear needed for Red-category injuries. Most
              first-aid kits have nothing for a Red patient. They&rsquo;re
              built around gauze and adhesive bandages, which can&rsquo;t
              stop arterial bleeding, clear an airway, or immobilize a
              fracture.
            </p>
            <p>
              A trauma kit is designed to handle multiple injuries on the
              same patient — or multiple patients at once. It should be able
              to treat each of the following.
            </p>
          </div>

          {/* Injury / Treatment table */}
          <section className="border-secondary-100 my-14 overflow-hidden rounded-2xl border">
            <div className="bg-secondary-50 grid grid-cols-1 md:grid-cols-2">
              <div className="border-secondary-100 p-6 md:border-r md:p-8">
                <h3 className="font-display text-secondary-900 mb-5 text-xl font-bold">
                  Injury Type
                </h3>
                <ol className="text-secondary-700 space-y-3 text-base">
                  {injuryTypes.map((item, i) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-primary-500 font-mono text-sm font-bold tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-display text-secondary-900 mb-5 text-xl font-bold">
                  Quality Item to Treat Injury
                </h3>
                <ol className="text-secondary-700 space-y-3 text-base">
                  {treatmentItems.map((item, i) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-primary-500 font-mono text-sm font-bold tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <div className="text-secondary-700 space-y-5 text-base leading-relaxed md:text-lg">
            <p>
              Pull a standard first-aid kit off the shelf and ask the hard
              questions. What&rsquo;s in here for an arterial wound? For a
              breathing problem — an airway tool or CPR pocket mask?
              Something to diagnose a fracture, and a splint large enough
              to immobilize it? Multiple ice packs or an instant ice wrap
              for a sprain? Supplies that might save a trip to the ER for a
              laceration that needs stitches?
            </p>
            <p>
              For most kits, the answer to all of those is{" "}
              <strong>no</strong>. A good trauma kit changes every one of
              those answers to <strong>yes</strong>.
            </p>
            <p>
              Every TNT First-Aid trauma kit is designed and built by
              medical professionals — no filler, no cheap padding, just the
              supplies that actually matter in an emergency. Cases are
              waterproof and crush-resistant, so your gear stays clean, dry,
              and ready. Everything is organized so you can find what you
              need when the adrenaline hits and seconds count.
            </p>
            <p>
              Every kit pairs with Virtual Medic, a video-based first aid
              app. Content downloads to your phone, so it works with or
              without cell service. A medical professional walks you through
              each technique, with realistic video matched to the injury
              you&rsquo;re dealing with.{" "}
              <Link
                href="/about"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Download Virtual Medic for $2.99
              </Link>{" "}
              — a fraction of the price of any first-aid book, and far more
              useful under pressure. A{" "}
              <Link
                href="/about"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Virtual Medic ASL
              </Link>{" "}
              edition is available with every video in sign language.
            </p>
            <p>
              Once you know what&rsquo;s actually in each kit, the price
              difference makes a lot more sense. The real question
              isn&rsquo;t cost — it&rsquo;s what you want on hand when it
              matters.
            </p>
            <p className="font-display text-secondary-900 text-xl font-bold md:text-2xl">
              A Trauma Kit, or a First-Aid Kit?
            </p>
          </div>

          {/* CTA */}
          <div className="bg-secondary-950 relative mt-16 overflow-hidden rounded-2xl p-8 text-center md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 30%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(227,24,55,0.12) 0%, transparent 55%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display mb-4 text-2xl font-bold text-white md:text-3xl">
                See which trauma kit is right for you
              </h2>
              <p className="text-secondary-300 mx-auto mb-6 max-w-lg text-sm">
                Browse our pre-built trauma kits — designed and built by
                medical professionals.
              </p>
              <Link
                href="/shop"
                className="bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-7 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-colors active:scale-[0.98]"
              >
                Shop Trauma Kits
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
