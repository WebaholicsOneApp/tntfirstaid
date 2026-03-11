import type { Metadata } from 'next';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Team Alpha',
    description: `Meet the team behind ${config.siteName} — experienced shooters, engineers, and craftsmen dedicated to precision.`,
  };
}

const teamMembers = [
  {
    name: 'Matt Kauber',
    role: 'Founder & CEO',
    bio: 'Competitive long-range shooter and the mind behind OCD Technology. Matt founded Alpha Munitions to solve the consistency problems he encountered in his own shooting career.',
  },
  {
    name: 'Ryan Caldwell',
    role: 'Head of Production',
    bio: 'With over 15 years in precision machining, Ryan oversees all manufacturing operations and ensures every component meets our exacting standards.',
  },
  {
    name: 'Jake Morrison',
    role: 'Ballistics Engineer',
    bio: 'Former aerospace engineer who applies his background in materials science to develop new cartridge designs and optimize existing product lines.',
  },
  {
    name: 'Sarah Chen',
    role: 'Quality Assurance Lead',
    bio: 'Sarah runs our QA processes including weight sorting, dimensional inspection, and consistency testing across every production batch.',
  },
  {
    name: 'Derek Holt',
    role: 'Reamer Design Specialist',
    bio: 'Master machinist and toolmaker who designs our precision chamber reamers. Derek brings decades of gunsmithing experience to every tool we produce.',
  },
  {
    name: 'Travis Briggs',
    role: 'Customer Relations',
    bio: 'An avid competitive shooter himself, Travis ensures every customer gets the expertise and support they need to find the right components for their build.',
  },
];

export default async function TeamAlphaPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="bg-secondary-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            The People
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Team Alpha
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            A team of shooters, engineers, and craftsmen united by an obsession
            with precision. Every member of our team is personally invested in
            the quality of what we produce.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Avatar placeholder */}
                <div className="aspect-[4/3] bg-secondary-100 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-secondary-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-secondary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-bold text-secondary-800">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Join the Team */}
          <div className="mt-20 bg-secondary-50 rounded-3xl p-10 md:p-16 text-center border border-secondary-100">
            <h2 className="text-3xl font-display font-bold text-secondary-800 mb-4">
              Join the Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              We are always looking for talented individuals who share our
              passion for precision manufacturing and the shooting sports. If you
              think you have what it takes, we want to hear from you.
            </p>
            <a
              href={`mailto:${storeConfig.email}?subject=Career%20Inquiry`}
              className="inline-block px-10 py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-colors text-sm uppercase tracking-widest"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
