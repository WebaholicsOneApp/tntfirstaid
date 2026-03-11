import type { Metadata } from 'next';
import Image from 'next/image';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Team Alpha',
    description: `Meet the team behind ${config.siteName} — experienced leaders driving precision ammunition innovation.`,
  };
}

const teamMembers = [
  {
    name: 'Mark Booth',
    initials: 'MB',
    role: 'Chief Executive Officer',
    bio: 'Over 35 years in the bio-pharmaceutical industry with a proven track record of building successful brands and companies.',
  },
  {
    name: 'Tom Danielson',
    initials: 'TD',
    role: 'President',
    bio: '18 years of experience in the medical device industry specializing in successful start-ups.',
  },
  {
    name: 'Andrew Rixon',
    initials: 'AR',
    role: 'VP of Engineering',
    bio: 'Joined Alpha in 2015. Graduated Colorado School of Mines. Drives engineering and manufacturing efforts.',
  },
];

export default async function TeamAlphaPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-24 md:py-36 overflow-hidden">
        <Image
          src="/images/about/banner.jpg"
          alt="Alpha Munitions facility"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            The People
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Team Alpha
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            A team of experienced leaders united by a shared commitment to
            producing the best precision rifle brass in the world.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Team Grid */}
          <div className="grid sm:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Initials Avatar */}
                <div className="aspect-[4/3] bg-secondary-50 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-secondary-900">
                      {member.initials}
                    </span>
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
