import type { Metadata } from "next";
import { LiteYouTube } from "~/components/ui/LiteYouTube";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Training Videos",
    description: `Free first aid training videos from ${config.siteName} — walkthroughs covering burns, fractures, tourniquets, CPR, chest wounds, eye injuries and more. Also available in American Sign Language.`,
  };
}

interface Video {
  title: string;
  category: string;
  youtubeId: string;
  aslYoutubeId?: string;
}

const videos: Video[] = [
  {
    title: "How To Treat 1st & 2nd Degree Burns",
    category: "Burns",
    youtubeId: "nhGBkwCM1gU",
    aslYoutubeId: "aeguVrHTJao",
  },
  {
    title: "How To Treat 3rd Degree Burns",
    category: "Burns",
    youtubeId: "fF3k99Wsnlw",
    aslYoutubeId: "dTl84nQBTG0",
  },
  {
    title: "How To Treat 1st & 2nd Degree Burn with BURN FREE",
    category: "Burns",
    youtubeId: "eD7pXwAXbTo",
  },
  {
    title: "How To Treat 3rd Degree Burns With BURN FREE",
    category: "Burns",
    youtubeId: "A3BgzxcfrkU",
  },
  {
    title: "How To Treat An Ankle Fracture",
    category: "Fractures & Sprains",
    youtubeId: "QDjMddLlfhA",
    aslYoutubeId: "fn99CaDMxSY",
  },
  {
    title: "How To Treat An Ankle Fracture With Just Ice And Ace Wrap",
    category: "Fractures & Sprains",
    youtubeId: "GJ9fuhLo2Ow",
    aslYoutubeId: "j1cuMgAcqug",
  },
  {
    title: "How To Bandage A Laceration",
    category: "Wounds & Lacerations",
    youtubeId: "5pX_Bv19Ic4",
    aslYoutubeId: "jEEiPkKPefc",
  },
  {
    title: "How To Use A CAT 5 Tourniquet",
    category: "Bleeding Control",
    youtubeId: "0f5tB8zo_hg",
    aslYoutubeId: "rXuWZJ5k5FE",
  },
  {
    title: "Gen 2 RATS Tourniquet Application",
    category: "Bleeding Control",
    youtubeId: "odmaY415XbM",
  },
  {
    title: "How To Rinse Out Chemicals In Your Eye With Saline Wash",
    category: "Eye Care",
    youtubeId: "hViqjG604R4",
    aslYoutubeId: "XwKCRcroGGE",
  },
  {
    title: "How To Clear Particles From Eye Using Eye Cup",
    category: "Eye Care",
    youtubeId: "YyftACV86dI",
    aslYoutubeId: "WexF_Vz87zY",
  },
  {
    title: "How To Use An Eye Magnet / Eye Loop Tool",
    category: "Eye Care",
    youtubeId: "RjCH6QvweYA",
  },
  {
    title: "How To Clean And Disinfect A Laceration",
    category: "Wounds & Lacerations",
    youtubeId: "76Qok7jZl2Y",
    aslYoutubeId: "h9VPTyqopJg",
  },
  {
    title: "How To Perform CPR",
    category: "CPR & Emergencies",
    youtubeId: "Pw8_R2fzlrc",
    aslYoutubeId: "NoCD6NxOtrc",
  },
  {
    title: "How To Detect A Fracture With A Fracture Fork",
    category: "Fractures & Sprains",
    youtubeId: "xIKqIM0UTQ0",
    aslYoutubeId: "4lJMPiFkHuc",
  },
  {
    title: "How To Differentiate Heat Exhaustion From Heat Stroke",
    category: "CPR & Emergencies",
    youtubeId: "_8HtV_VPjc0",
    aslYoutubeId: "QDTNTWQAWcw",
  },
  {
    title: "How To Treat A Femur Fracture With A Traction Splint",
    category: "Fractures & Sprains",
    youtubeId: "9Fjlt2rNr3M",
    aslYoutubeId: "jR1nIZfVSY4",
  },
  {
    title: "How To Treat A Head Wound With Wound Seal Powder",
    category: "Wounds & Lacerations",
    youtubeId: "1O7ikklV96U",
    aslYoutubeId: "StcPOsaTSrU",
  },
  {
    title: "How To Treat A Head Wound Without Wound Seal Powder",
    category: "Wounds & Lacerations",
    youtubeId: "NqDBxl08Qn0",
    aslYoutubeId: "M4_oYLT5RZ4",
  },
  {
    title: "How To Make Your Own Sterile Saline",
    category: "Preparedness",
    youtubeId: "P0JHkuLFLEY",
    aslYoutubeId: "gyoVro-TGg8",
  },
  {
    title: "How To Make Your Own Tourniquet At Home",
    category: "Bleeding Control",
    youtubeId: "j-ufGOXNaAs",
    aslYoutubeId: "uE4vCvJ1kKc",
  },
  {
    title: "How To Immobilize The Shoulder With Home-Made Sling",
    category: "Shoulder",
    youtubeId: "JSke46jWk5Q",
    aslYoutubeId: "nI8h1rV9V2w",
  },
  {
    title: "How To Immobilize The Shoulder With Manufactured Sling",
    category: "Shoulder",
    youtubeId: "wb1LXGWADjg",
    aslYoutubeId: "U404vdKZiuc",
  },
  {
    title: "How To Use QuickClot",
    category: "Bleeding Control",
    youtubeId: "4MkEuXhYbuk",
    aslYoutubeId: "1FSAGjvUvpM",
  },
  {
    title: "How To Reset Anterior Shoulder Dislocation",
    category: "Shoulder",
    youtubeId: "DYminOsOXms",
    aslYoutubeId: "zzGesUK65zc",
  },
  {
    title: "How To Treat A Sprain With Wrap-it-Cool",
    category: "Fractures & Sprains",
    youtubeId: "d651WE75Riw",
    aslYoutubeId: "XFa5516sEf4",
  },
  {
    title: "How To Stop Nose Bleeds With Wound Seal Powder",
    category: "Wounds & Lacerations",
    youtubeId: "-vQy8PsND8o",
    aslYoutubeId: "OjalDTj8JoM",
  },
  {
    title: "How To Stop Nose Bleeds Without Wound Seal Powder",
    category: "Wounds & Lacerations",
    youtubeId: "vXXPeQYDXow",
    aslYoutubeId: "3TSHz6hM3xc",
  },
  {
    title: "How To Treat An Open Fracture With A STAT Splint",
    category: "Fractures & Sprains",
    youtubeId: "2dqyejgdlK4",
    aslYoutubeId: "tlplghCDkfQ",
  },
  {
    title: "How To Treat A Chest Wound With Home-Made Chest Seal",
    category: "Chest Wounds",
    youtubeId: "UP3YN3a69lg",
    aslYoutubeId: "Ej5P5euCAHU",
  },
  {
    title: "How To Treat A Chest Wound With HALO Chest Seal",
    category: "Chest Wounds",
    youtubeId: "eeg8_5oH6ow",
    aslYoutubeId: "2Llmj-9mWus",
  },
  {
    title: "How To Treat A Chest Wound With HYFIN Chest Seal",
    category: "Chest Wounds",
    youtubeId: "dqt5-PsgJ1I",
  },
  {
    title: "How To Treat A Chest Wound With Non-Vented Chest Seal",
    category: "Chest Wounds",
    youtubeId: "O4FACKTM5V8",
  },
  {
    title: "How To Treat A Carotid Artery Laceration With NU STAT",
    category: "Bleeding Control",
    youtubeId: "MXJNkjylFT0",
  },
];

const aslHelpTerms: { title: string; youtubeId: string }[] = [
  { title: "Help in ASL", youtubeId: "wqPCnnF_LJo" },
  { title: "Stay. Don't Move in ASL", youtubeId: "9-BdDsRe5po" },
  { title: "I've Called For Emergency Help in ASL", youtubeId: "r6HtgLdlq4Q" },
  {
    title: "Don't Worry. You'll Be Alright in ASL",
    youtubeId: "kzdnj53B8RQ",
  },
];

function VideoCard({
  title,
  category,
  youtubeId,
}: {
  title: string;
  category: string;
  youtubeId: string;
}) {
  return (
    <article className="border-secondary-100 group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg">
      <div className="bg-secondary-950 relative aspect-video overflow-hidden">
        <LiteYouTube youtubeId={youtubeId} title={title} />
      </div>
      <div className="p-6">
        <div className="mb-3">
          <span className="text-primary-600 bg-primary-500/10 rounded-full px-3 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase">
            {category}
          </span>
        </div>
        <h3 className="font-display text-secondary-900 group-hover:text-primary-600 text-lg font-bold transition-colors">
          {title}
        </h3>
      </div>
    </article>
  );
}

export default async function TrainingVideosPage() {
  const aslTranslations = videos.filter((v) => v.aslYoutubeId);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        {/* Ambient red glow behind the defib focal point */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 650px 550px at 72% 50%, rgba(227,24,55,0.28) 0%, transparent 65%)",
          }}
        />
        {/* Defibrillator pulse: medical cross with emanating rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <svg
            className="absolute top-1/2 left-[62%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 sm:left-[70%] md:h-[560px] md:w-[560px]"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth="2"
              className="animate-defib-ring"
            />
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth="2"
              className="animate-defib-ring"
              style={{ animationDelay: "3s" }}
            />
            {/* Lightning sparks — flash at the moment the cross fires */}
            <g
              className="animate-defib-spark"
              stroke="white"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))",
              }}
            >
              <path d="M 200 120 L 192 95 L 208 80 L 198 55 L 212 35" />
              <path d="M 280 200 L 305 195 L 318 210 L 343 200 L 362 215" />
              <path d="M 200 280 L 208 305 L 192 318 L 202 343 L 188 362" />
              <path d="M 120 200 L 95 205 L 82 190 L 57 200 L 38 185" />
            </g>
            {/* Medical cross — charges, flashes, recovers on each cycle */}
            <g className="animate-defib-cross-flash">
              <rect
                x="180"
                y="125"
                width="40"
                height="150"
                rx="6"
                fill="white"
              />
              <rect
                x="125"
                y="180"
                width="150"
                height="40"
                rx="6"
                fill="white"
              />
            </g>
          </svg>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Free Resources
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              Training Videos
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Over {videos.length} injury-treatment walkthroughs covering
              burns, fractures, tourniquets, CPR, chest wounds, eye injuries,
              and more. Also available in American Sign Language.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#videos"
                className="bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center rounded-full px-5 py-2 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
              >
                Browse Videos
              </a>
              <a
                href="#asl"
                className="border-primary-500/40 text-primary-300 hover:border-primary-500 hover:text-white inline-flex items-center rounded-full border px-5 py-2 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
              >
                ASL Videos
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <section id="videos" className="scroll-mt-24">
            <div className="mb-10 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-8" />
              <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                Training Videos
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard
                  key={video.youtubeId}
                  title={video.title}
                  category={video.category}
                  youtubeId={video.youtubeId}
                />
              ))}
            </div>
          </section>

          <section id="asl" className="mt-24 scroll-mt-24">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-8" />
              <span className="text-primary-600 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                American Sign Language
              </span>
            </div>
            <h2 className="font-display text-secondary-900 mb-2 text-2xl font-bold md:text-3xl">
              Training Videos in ASL
            </h2>
            <p className="text-secondary-600 mb-10 max-w-2xl text-sm leading-relaxed">
              The same walkthroughs interpreted in American Sign Language, plus
              a short set of emergency-help phrases.
            </p>

            <h3 className="font-display text-secondary-900 mb-6 text-lg font-bold">
              Help Terms
            </h3>
            <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {aslHelpTerms.map((term) => (
                <VideoCard
                  key={term.youtubeId}
                  title={term.title}
                  category="Help Terms"
                  youtubeId={term.youtubeId}
                />
              ))}
            </div>

            <h3 className="font-display text-secondary-900 mb-6 text-lg font-bold">
              Treatment Videos
            </h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {aslTranslations.map((video) => (
                <VideoCard
                  key={video.aslYoutubeId}
                  title={video.title}
                  category={video.category}
                  youtubeId={video.aslYoutubeId!}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
