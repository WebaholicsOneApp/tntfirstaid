import type { Metadata } from "next";
import Image from "next/image";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Team Alpha",
    description: `Meet the team behind ${config.siteName} — experienced leaders driving precision ammunition innovation.`,
  };
}

const teamMembers = [
  {
    name: "Mark Booth",
    initials: "MB",
    role: "Chief Executive Officer",
    bio: "Over 35 years in the bio-pharmaceutical industry with a proven track record of building successful brands and companies.",
  },
  {
    name: "Tom Danielson",
    initials: "TD",
    role: "President",
    bio: "18 years of experience in the medical device industry specializing in successful start-ups.",
  },
  {
    name: "Andrew Rixon",
    initials: "AR",
    role: "VP of Engineering",
    bio: "Joined Alpha in 2015. Graduated Colorado School of Mines. Drives engineering and manufacturing efforts.",
  },
];

export default async function TeamAlphaPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/about/banner.jpg"
          alt="TNT First Aid facility"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                The Team
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              Team Alpha
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/60">
              A team of experienced leaders united by a shared commitment to
              producing the best precision rifle brass in the world.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          {/* Team Grid */}
          <div className="grid gap-8 sm:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="border-secondary-100 overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg"
              >
                {/* Initials Avatar */}
                <div className="bg-secondary-50 flex aspect-[4/3] items-center justify-center">
                  <div className="bg-primary-500 flex h-28 w-28 items-center justify-center rounded-full">
                    <span className="font-display text-secondary-900 text-3xl font-bold">
                      {member.initials}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-secondary-900 text-lg font-bold">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 mb-3 text-sm font-medium">
                    {member.role}
                  </p>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Join the Team */}
          <div className="bg-secondary-50 border-secondary-100 relative mt-20 rounded-2xl border p-10 text-center md:p-16">
            <div className="border-secondary-200 absolute top-6 left-6 h-8 w-8 border-t border-l" />
            <div className="border-secondary-200 absolute top-6 right-6 h-8 w-8 border-t border-r" />
            <div className="border-secondary-200 absolute bottom-6 left-6 h-8 w-8 border-b border-l" />
            <div className="border-secondary-200 absolute right-6 bottom-6 h-8 w-8 border-r border-b" />
            <h2 className="font-display text-secondary-900 mb-4 text-3xl font-bold">
              Join the Team
            </h2>
            <p className="text-secondary-600 mx-auto mb-8 max-w-2xl leading-relaxed">
              We are always looking for talented individuals who share our
              passion for precision manufacturing and the shooting sports. If
              you think you have what it takes, we want to hear from you.
            </p>
            <a
              href={`mailto:${storeConfig.email}?subject=Career%20Inquiry`}
              className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              Get in Touch
              <span className="bg-secondary-950/10 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110">
                <svg
                  className="h-2.5 w-2.5"
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
              </span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
