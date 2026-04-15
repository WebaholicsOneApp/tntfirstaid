import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Training Videos",
    description: `Free first aid and CPR training videos from ${config.siteName} — refreshers between certifications and quick-reference guides.`,
  };
}

interface Video {
  title: string;
  category: string;
  duration: string;
  description: string;
  youtubeId?: string;
}

const videos: Video[] = [
  {
    title: "Hands-Only CPR Refresher",
    category: "CPR",
    duration: "4 min",
    description:
      "A quick refresher on compression-only CPR for adults — rate, depth, and when to use it.",
  },
  {
    title: "How to Use an AED",
    category: "AED",
    duration: "5 min",
    description:
      "Step-by-step walkthrough of an AED from cabinet to first shock, plus what to do between shocks.",
  },
  {
    title: "Applying a Tourniquet",
    category: "Stop the Bleed",
    duration: "3 min",
    description:
      "Proper tourniquet placement and tightening technique for life-threatening extremity bleeding.",
  },
  {
    title: "Wound Packing",
    category: "Stop the Bleed",
    duration: "4 min",
    description:
      "How to pack a deep wound with gauze and apply direct pressure when a tourniquet isn't an option.",
  },
  {
    title: "Recognizing a Stroke (FAST)",
    category: "Medical Emergencies",
    duration: "3 min",
    description:
      "Using the FAST method — Face, Arms, Speech, Time — to spot a stroke and get help quickly.",
  },
  {
    title: "Choking Response: Adult",
    category: "First Aid",
    duration: "3 min",
    description:
      "Heimlich maneuver for a conscious adult, plus what to do if the victim becomes unresponsive.",
  },
  {
    title: "Choking Response: Infant",
    category: "First Aid",
    duration: "4 min",
    description:
      "Back blows and chest thrusts for choking infants under one year old.",
  },
  {
    title: "Burn Care Basics",
    category: "First Aid",
    duration: "4 min",
    description:
      "Identifying burn severity and when to cool, cover, and seek medical attention.",
  },
  {
    title: "Building a Home First Aid Kit",
    category: "Preparedness",
    duration: "6 min",
    description:
      "What to stock, what to skip, and how to keep your home kit ready year-round.",
  },
];

export default async function TrainingVideosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(227,24,55,0.15) 0%, transparent 55%)",
          }}
        />
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
              Short, practical refreshers on the skills we teach in class.
              Great for between-certification review or quick reference when
              you need to brush up.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.title}
                className="border-secondary-100 group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg"
              >
                {/* Video placeholder / future embed */}
                <div className="bg-secondary-950 relative aspect-video overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, rgba(227,24,55,0.30) 0%, transparent 65%)",
                    }}
                  />
                  {video.youtubeId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="bg-primary-500/20 border-primary-500/40 mb-3 flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur">
                        <svg
                          className="text-primary-400 ml-0.5 h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-primary-400/70 font-mono text-[0.55rem] tracking-[0.25em] uppercase">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-primary-600 bg-primary-500/10 rounded-full px-3 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase">
                      {video.category}
                    </span>
                    <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                      {video.duration}
                    </span>
                  </div>
                  <h2 className="font-display text-secondary-900 group-hover:text-primary-600 mb-2 text-lg font-bold transition-colors">
                    {video.title}
                  </h2>
                  <p className="text-secondary-500 text-sm leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <p className="text-secondary-500 mb-6 text-sm">
              Videos are a refresher — not a substitute for hands-on
              certification. Book a live class to get certified.
            </p>
            <Link
              href="/services"
              className="group border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white inline-flex items-center gap-3 rounded-full border px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              View Training Services
              <svg
                className="h-2.5 w-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
