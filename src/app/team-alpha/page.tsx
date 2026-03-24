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
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <Image
          src="/images/about/banner.jpg"
          alt="Alpha Munitions facility"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-primary-400 uppercase">The Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Team Alpha</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg">A team of experienced leaders united by a shared commitment to producing the best precision rifle brass in the world.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Team Grid */}
          <div className="grid sm:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white border border-secondary-100 overflow-hidden hover:shadow-lg transition-shadow"
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
                  <h3 className="text-lg font-display font-bold text-secondary-900">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 text-sm font-medium mb-3">
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
          <div className="mt-20 bg-secondary-50 p-10 md:p-16 text-center border border-secondary-100 relative">
            <div className="absolute top-6 left-6 h-8 w-8 border-t border-l border-secondary-200" />
            <div className="absolute top-6 right-6 h-8 w-8 border-t border-r border-secondary-200" />
            <div className="absolute bottom-6 left-6 h-8 w-8 border-b border-l border-secondary-200" />
            <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-secondary-200" />
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              Join the Team
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              We are always looking for talented individuals who share our
              passion for precision manufacturing and the shooting sports. If you
              think you have what it takes, we want to hear from you.
            </p>
            <a
              href={`mailto:${storeConfig.email}?subject=Career%20Inquiry`}
              className="group relative inline-block overflow-hidden border border-primary-500 font-mono text-sm tracking-[0.2em] uppercase px-10 py-4"
            >
              <span className="absolute inset-0 -translate-x-full bg-primary-500 transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
              <span className="relative z-10 text-primary-500 group-hover:text-secondary-900 transition-colors duration-500">Get in Touch</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
