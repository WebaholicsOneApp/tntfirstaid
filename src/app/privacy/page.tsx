import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";
import { getPolicyTemplates } from "~/lib/db";
import {
  mergePrivacyPolicy,
  resolveTemplate,
  type PrivacyPolicyConfig,
} from "~/lib/policy-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Privacy Policy",
    description: `Privacy policy for ${config.siteName}. Learn how we collect, use, and protect your personal information.`,
  };
}

export default async function PrivacyPolicyPage() {
  const storeConfig = await getStoreConfig();
  const siteName = storeConfig.siteName;
  const policyTemplates = await getPolicyTemplates();
  const config: PrivacyPolicyConfig = mergePrivacyPolicy(
    policyTemplates.privacy_policy as Partial<PrivacyPolicyConfig> | undefined,
  );

  const vars: Record<string, string> = {
    siteName,
    siteDomain: storeConfig.siteDomain,
    supportEmail: storeConfig.supportEmail,
    phone: storeConfig.phone,
  };
  const overviewText = resolveTemplate(config.overviewText, vars);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="text-secondary-400 container mx-auto px-4 py-4 font-mono text-xs tracking-wider">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="text-secondary-300 mx-2">/</span>
        <span className="text-secondary-500 font-medium">Privacy Policy</span>
      </nav>

      {/* Hero Header */}
      <header className="bg-secondary-900 relative overflow-hidden py-12 md:py-16">
        <div className="bg-primary-500/5 pointer-events-none absolute inset-0" />
        <div className="border-primary-500/15 absolute top-6 left-6 z-10 h-8 w-8 border-t border-l" />
        <div className="border-primary-500/15 absolute top-6 right-6 z-10 h-8 w-8 border-t border-r" />
        <div className="border-primary-500/15 absolute bottom-6 left-6 z-10 h-8 w-8 border-b border-l" />
        <div className="border-primary-500/15 absolute right-6 bottom-6 z-10 h-8 w-8 border-r border-b" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
            Privacy <span className="text-primary-500">Policy</span>
          </h1>
          <p className="text-secondary-400 mx-auto max-w-2xl text-lg">
            {config.heroSubtitle}
          </p>
          <p className="text-secondary-500 mt-4 text-sm">
            Last updated: {config.lastUpdatedDate}
          </p>
          <div className="via-primary-500/30 mx-auto mt-4 h-[1px] w-[80px] bg-gradient-to-r from-transparent to-transparent" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Overview */}
          {config.showOverview && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Overview
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 text-secondary-600 space-y-4 border p-8 leading-relaxed md:p-12">
                <p>{overviewText}</p>
                <p>
                  By using our website, you agree to the collection and use of
                  information in accordance with this policy. If you do not
                  agree with the terms of this policy, please do not access the
                  site.
                </p>
              </div>
            </section>
          )}

          {/* Information We Collect */}
          {config.showInformationWeCollect && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-secondary-100 text-secondary-700 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Information We Collect
                </h2>
              </div>
              <div className="space-y-6">
                <div className="border-secondary-100 border bg-white p-8">
                  <h3 className="text-secondary-900 mb-4 text-lg font-bold">
                    Personal Information
                  </h3>
                  <p className="text-secondary-600 mb-4 leading-relaxed">
                    When you make a purchase, we may collect the following
                    information:
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      "Full name",
                      "Email address",
                      "Shipping and billing address",
                      "Phone number",
                      "Payment information (processed securely via Stripe)",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </div>
                        <span className="text-secondary-600 text-sm">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-secondary-100 border bg-white p-8">
                  <h3 className="text-secondary-900 mb-4 text-lg font-bold">
                    Automatically Collected Information
                  </h3>
                  <p className="text-secondary-600 mb-4 leading-relaxed">
                    When you browse our website, we automatically collect
                    certain information about your device:
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      "Browser type and version",
                      "IP address",
                      "Pages visited and time spent",
                      "Referring website",
                      "Device type and operating system",
                      "Cookies and similar tracking technologies",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="bg-secondary-100 text-secondary-500 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </div>
                        <span className="text-secondary-600 text-sm">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* How We Use Your Information */}
          {config.showHowWeUseInfo && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  How We Use Your Information
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 border p-8 md:p-12">
                <div className="space-y-4">
                  {[
                    {
                      title: "Process Orders",
                      desc: "Fulfill and ship your orders, process payments, and send order confirmations and shipping updates.",
                    },
                    {
                      title: "Customer Support",
                      desc: "Respond to your inquiries, resolve issues, and provide customer service.",
                    },
                    {
                      title: "Improve Our Services",
                      desc: "Analyze website usage to improve our product catalog, website experience, and customer service.",
                    },
                    {
                      title: "Marketing Communications",
                      desc: "Send you promotional emails about new products, deals, and updates. You can unsubscribe at any time.",
                    },
                    {
                      title: "Fraud Prevention",
                      desc: "Detect and prevent fraudulent transactions and protect against unauthorized access.",
                    },
                    {
                      title: "Legal Compliance",
                      desc: "Comply with applicable laws, regulations, and legal processes.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="border-secondary-100 flex items-start gap-4 rounded-xl border bg-white p-4"
                    >
                      <span className="text-primary-600 mt-0.5 text-lg font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-secondary-900 text-sm font-bold">
                          {item.title}
                        </h4>
                        <p className="text-secondary-600 mt-1 text-sm">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Information Sharing */}
          {config.showInformationSharing && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Information Sharing
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-6 border bg-white p-8 leading-relaxed md:p-12">
                <p>
                  We do{" "}
                  <span className="text-secondary-900 font-bold">not</span>{" "}
                  sell, trade, or rent your personal information to third
                  parties. We may share your information only in the following
                  circumstances:
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bg-secondary-50 border-secondary-100 rounded-xl border p-6">
                    <h4 className="text-secondary-900 mb-3 text-sm font-bold">
                      Service Providers
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      With trusted third parties who assist in operating our
                      website, processing payments (Stripe), and shipping orders
                      (UPS).
                    </p>
                  </div>
                  <div className="bg-secondary-50 border-secondary-100 rounded-xl border p-6">
                    <h4 className="text-secondary-900 mb-3 text-sm font-bold">
                      Legal Requirements
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      When required by law, subpoena, or other legal process, or
                      to protect our rights, property, or safety.
                    </p>
                  </div>
                  <div className="bg-secondary-50 border-secondary-100 rounded-xl border p-6">
                    <h4 className="text-secondary-900 mb-3 text-sm font-bold">
                      Business Transfers
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      In connection with a merger, acquisition, or sale of
                      assets, your information may be transferred as a business
                      asset.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cookies */}
          {config.showCookiesTracking && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Cookies & Tracking
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>
                  We use cookies and similar technologies to enhance your
                  browsing experience. Cookies are small data files stored on
                  your device that help us remember your preferences and
                  understand how you use our site.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <span className="text-secondary-900 mt-0.5 w-28 flex-shrink-0 text-sm font-bold">
                      Essential
                    </span>
                    <p className="text-sm">
                      Required for the website to function properly (cart,
                      checkout).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-secondary-900 mt-0.5 w-28 flex-shrink-0 text-sm font-bold">
                      Analytics
                    </span>
                    <p className="text-sm">
                      Help us understand how visitors interact with our website
                      to improve performance.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-secondary-900 mt-0.5 w-28 flex-shrink-0 text-sm font-bold">
                      Marketing
                    </span>
                    <p className="text-sm">
                      Used to deliver relevant advertisements and track campaign
                      effectiveness.
                    </p>
                  </div>
                </div>
                <p className="text-secondary-500 pt-2 text-sm">
                  You can control cookies through your browser settings.
                  Disabling certain cookies may affect website functionality.
                </p>
              </div>
            </section>
          )}

          {/* Data Security */}
          {config.showDataSecurity && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-secondary-800 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Data Security
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 text-secondary-600 space-y-4 border p-8 leading-relaxed md:p-12">
                <p>
                  We implement industry-standard security measures to protect
                  your personal information:
                </p>
                <div className="grid gap-4 pt-2 md:grid-cols-2">
                  {[
                    "SSL/TLS encryption on all pages",
                    "PCI-compliant payment processing via Stripe",
                    "Secure database storage with encryption at rest",
                    "Regular security audits and monitoring",
                    "Access controls and authentication",
                    "Automated threat detection",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="border-secondary-100 flex items-center gap-3 rounded-xl border bg-white p-3"
                    >
                      <div className="bg-primary-500/10 text-primary-600 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-secondary-500 pt-2 text-sm">
                  While we strive to protect your information, no method of
                  transmission over the internet is 100% secure. We cannot
                  guarantee absolute security but are committed to maintaining
                  the highest standards.
                </p>
              </div>
            </section>
          )}

          {/* Your Rights */}
          {config.showYourRights && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Your Rights
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>You have the right to:</p>
                <div className="space-y-3">
                  {[
                    "Access the personal information we hold about you",
                    "Request correction of inaccurate information",
                    "Request deletion of your personal data",
                    "Opt out of marketing communications at any time",
                    "Request a copy of your data in a portable format",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                      <span className="text-secondary-600">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-secondary-500 pt-2 text-sm">
                  To exercise any of these rights, please contact us at{" "}
                  <a
                    href={`mailto:${storeConfig.supportEmail}`}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    {storeConfig.supportEmail}
                  </a>
                  . We will respond to your request within{" "}
                  {config.rightsResponseDays} days.
                </p>
              </div>
            </section>
          )}

          {/* Children's Privacy */}
          {config.showChildrensPrivacy && (
            <section>
              <div className="border-secondary-100 text-secondary-600 border bg-white p-8 leading-relaxed">
                <h3 className="text-secondary-900 mb-3 text-lg font-bold">
                  Children&apos;s Privacy
                </h3>
                <p>
                  Our website is not intended for children under{" "}
                  {config.childrenMinAge} years of age. We do not knowingly
                  collect personal information from children under{" "}
                  {config.childrenMinAge}. If we become aware that we have
                  collected data from a child under {config.childrenMinAge}, we
                  will take steps to delete it promptly.
                </p>
              </div>
            </section>
          )}

          {/* Changes to This Policy */}
          {config.showChangesToPolicy && (
            <section>
              <div className="border-secondary-100 text-secondary-600 border bg-white p-8 leading-relaxed">
                <h3 className="text-secondary-900 mb-3 text-lg font-bold">
                  Changes to This Policy
                </h3>
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. We will post the revised policy on this
                  page with an updated &quot;Last updated&quot; date. Your
                  continued use of our website after any changes constitutes
                  your acceptance of the updated policy.
                </p>
              </div>
            </section>
          )}

          {/* Contact CTA */}
          {config.showContactCta && (
            <div className="bg-secondary-900 relative overflow-hidden p-10 text-center md:p-16">
              <div className="border-primary-500/25 absolute top-6 left-6 h-8 w-8 border-t border-l" />
              <div className="border-primary-500/25 absolute top-6 right-6 h-8 w-8 border-t border-r" />
              <div className="border-primary-500/25 absolute bottom-6 left-6 h-8 w-8 border-b border-l" />
              <div className="border-primary-500/25 absolute right-6 bottom-6 h-8 w-8 border-r border-b" />
              <div className="relative z-10">
                <h2 className="font-display mb-6 text-2xl font-bold text-white md:text-4xl">
                  Have <span className="text-primary-500">Questions?</span>
                </h2>
                <p className="text-secondary-400 mx-auto mb-8 max-w-lg">
                  {config.contactCtaText}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/contact"
                    className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Contact Us
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
                  </Link>
                  <a
                    href={`mailto:${storeConfig.supportEmail}`}
                    className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 hover:text-primary-400 inline-flex items-center rounded-full border px-8 py-3.5 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
