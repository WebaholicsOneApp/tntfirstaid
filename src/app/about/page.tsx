import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "About Us",
    description: `Learn about ${config.siteName} — family-owned since 2011 in Kaysville, Utah. Professional first aid supplies, AHA-certified training, OSHA compliance, and emergency preparedness.`,
  };
}

const STROKE = "currentColor";

const values = [
  {
    title: "Preparedness",
    description:
      "Emergencies don't wait. We help you stock the right gear and train the right people so you're ready before it happens — not scrambling after.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Expertise",
    description:
      "Our instructors are working EMS and emergency care professionals. When you train with us, you learn from people who use these skills in the field every day.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    title: "Service",
    description:
      "From a single home kit to a nationwide workplace rollout, we treat every customer like the emergency responders they could become.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke={STROKE} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
];

const offerings = [
  "First-Aid Product Sales",
  "CPR / First Aid Training (American Heart Association)",
  "OSHA Written Documents & Preparation",
  "OSHA Safety Inspections & Training Courses",
  "Safety Products",
  "Emergency Planning for Homes & Businesses",
  "16-Hour Disaster Medicine Training",
  "Active Shooter Training Course",
  "Mass Casualty Disaster Drills",
];

export default async function AboutPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/old-site/hero-services.jpg"
          alt=""
          fill
          priority
          className="object-contain"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.75) 40%, rgba(20,6,10,0.5) 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 text-sm font-semibold tracking-wide uppercase">
                Our Story
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              About {storeConfig.siteName}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Founded by medical professionals in 2011 and based in Kaysville,
              Utah — serving businesses, families, and first responders with
              quality supplies and expert training.
            </p>
          </div>
        </div>
      </header>

      <main>
        {/* Who We Are */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                  Who We Are
                </span>
              </div>
              <h2 className="font-display text-secondary-900 mb-6 text-3xl font-bold md:text-4xl">
                In business since 2011.
              </h2>
              <div className="text-secondary-600 space-y-5 text-lg leading-relaxed">
                <p>
                  TNT First-Aid has been serving customers since 2011 from our
                  home in Kaysville, Utah. We were founded by medical
                  professionals with a passion for preparedness &mdash; for
                  businesses as well as families &mdash; and we&rsquo;ve spent
                  over a decade finding the best quality products on the market
                  to help our customers reduce costly emergency room visits and
                  often find better healing results.
                </p>
                <p>
                  Whether you&rsquo;re a business looking for your first aid
                  solutions, a family looking for training and proper first aid
                  in your home, or an emergency first responder stocking up,
                  we&rsquo;re your answer. We&rsquo;re the best product and
                  training company for all your needs &mdash; and you&rsquo;ll
                  be trained by professionals who work in EMS and emergency
                  care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-secondary-50 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 text-center">
                <div className="mb-3 flex items-center justify-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                    What We Offer
                  </span>
                </div>
                <h2 className="font-display text-secondary-900 text-3xl font-bold md:text-4xl">
                  Products, training, and planning &mdash; all under one roof.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offerings.map((item) => (
                  <div
                    key={item}
                    className="border-secondary-100 flex items-start gap-3 rounded-xl border bg-white p-5"
                  >
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-secondary-700 text-sm font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-secondary-500 mx-auto mt-10 max-w-2xl text-center text-sm">
                Order online or call for special pricing and discounts.
                Military members and government agencies always receive a
                discount.
              </p>
            </div>
          </div>
        </section>

        {/* Virtual Medic App */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                    Virtual Medic App
                  </span>
                </div>
                <h2 className="font-display text-secondary-900 mb-5 text-3xl font-bold md:text-4xl">
                  The first video-based first aid app.
                </h2>
                <div className="text-secondary-600 space-y-4 text-base leading-relaxed">
                  <p>
                    We released the first ever video-based first aid app for
                    your phone. Content downloads to your device and walks you
                    through every kind of medical emergency &mdash; from nose
                    bleeds to fractures and punctured lungs &mdash; so it works
                    even when you don&rsquo;t have cell service.
                  </p>
                  <p>
                    The whole app uses less than 30 MB of storage. First aid
                    books cost ten times the price and can&rsquo;t show you a
                    real-looking injury to treat as you follow along. Virtual
                    Medic is available for iOS and Android, and we now offer
                    <strong className="text-secondary-800">
                      {" "}
                      Virtual Medic ASL
                    </strong>{" "}
                    with every video in sign language and full subtitles.
                  </p>
                  <p className="text-secondary-500 text-sm italic">
                    Download it today &mdash; it may help you save the life of
                    someone you love.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div
                  aria-hidden
                  className="bg-primary-500/10 absolute -inset-4 rounded-3xl blur-2xl"
                />
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src="/images/old-site/hero-app.jpg"
                    alt="Virtual Medic App — video-based first aid for iOS and Android"
                    width={870}
                    height={412}
                    className="w-full rounded-2xl"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="bg-secondary-100 text-secondary-700 rounded-full px-4 py-2 text-xs font-semibold">
                    iOS
                  </span>
                  <span className="bg-secondary-100 text-secondary-700 rounded-full px-4 py-2 text-xs font-semibold">
                    Android
                  </span>
                  <span className="bg-primary-500/10 text-primary-600 rounded-full px-4 py-2 text-xs font-semibold">
                    ASL Edition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-secondary-950 relative overflow-hidden py-28 md:py-36">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(227,24,55,0.25) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
            <Image
              src="/images/tnt-logo.png"
              alt="TNT First Aid"
              width={100}
              height={100}
              className="mx-auto mb-8"
            />
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="bg-primary-500/60 h-px w-6" />
              <span className="text-primary-400 text-sm font-semibold tracking-wide uppercase">
                Our Mission
              </span>
              <div className="bg-primary-500/60 h-px w-6" />
            </div>
            <h2 className="font-display mb-6 text-3xl font-bold text-white md:text-5xl">
              Prepared people save lives.
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed">
              We believe every workplace, classroom, and home should have the
              gear to respond to a medical emergency &mdash; and at least one
              person who knows how to use it. That&rsquo;s the whole point of
              what we do.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                  What Drives Us
                </span>
              </div>
              <h2 className="font-display text-secondary-900 text-3xl font-bold md:text-4xl">
                Our Values
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-secondary-50 border-secondary-100 rounded-2xl border p-8 text-center"
                >
                  <div className="bg-primary-500/10 text-primary-600 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded">
                    {value.icon}
                  </div>
                  <h3 className="font-display text-secondary-800 mb-3 text-xl font-bold">
                    {value.title}
                  </h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-secondary-50 py-20 md:py-28">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-10 text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                  From A Customer
                </span>
              </div>
              <h2 className="font-display text-secondary-900 text-3xl font-bold md:text-4xl">
                In their words.
              </h2>
            </div>
            <figure className="border-secondary-100 relative rounded-2xl border bg-white p-8 md:p-12">
              <svg
                aria-hidden
                className="text-primary-500/20 absolute top-6 left-6 h-12 w-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
              <blockquote className="relative">
                <p className="text-secondary-700 mb-6 text-lg leading-relaxed italic md:text-xl">
                  &ldquo;I came across TNT First-Aid while shopping for trauma
                  and first aid supplies. I gave Jeff a call and he spent time
                  answering all my questions about the proper supplies I should
                  be keeping in my kit. I told him I was in search of a quality
                  backpack for my medical supplies, and he shared details of a
                  new backpack he was developing that sounded exactly like what
                  I was looking for.
                </p>
                <p className="text-secondary-700 mb-6 text-lg leading-relaxed italic md:text-xl">
                  I received my backpack today and I&rsquo;m thrilled with the
                  quality and space it offers. It&rsquo;s perfect for anyone
                  serious about storing their medical supplies &mdash; easy
                  access, clear pockets to view everything you need. Jeff
                  really thought this through. I&rsquo;ve bought several
                  different bags over the years and this is by far my favorite.
                  I don&rsquo;t believe I&rsquo;ll ever need another
                  backpack/bag again.
                </p>
                <p className="text-secondary-700 text-lg leading-relaxed italic md:text-xl">
                  Thank you Jeff for your sincere advice and consultative
                  approach. TNT First-Aid is my go-to source for all my First
                  Aid supplies.&rdquo;
                </p>
              </blockquote>
              <figcaption className="border-secondary-100 mt-8 flex items-center gap-4 border-t pt-6">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold">
                  AH
                </div>
                <div>
                  <div className="text-secondary-900 font-semibold">
                    Adam Herrman
                  </div>
                  <div className="text-secondary-500 text-sm">Optimum</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="bg-secondary-950 relative overflow-hidden rounded-2xl p-10 text-center md:p-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 30%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(227,24,55,0.12) 0%, transparent 55%)",
                }}
              />
              <div className="relative z-10">
                <h2 className="font-display mb-4 text-3xl font-bold text-white md:text-4xl">
                  Ready to stock up or train up?
                </h2>
                <p className="text-secondary-300 mx-auto mb-8 max-w-lg">
                  Browse our kits and supplies, or get in touch to schedule
                  on-site CPR and First Aid training for your team. Military
                  and government discounts available.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="group bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold uppercase shadow-[0_8px_30px_rgba(227,24,55,0.35)] transition-colors active:scale-[0.98]"
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
          </div>
        </section>
      </main>
    </div>
  );
}
