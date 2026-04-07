import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";
import { getPolicyTemplates } from "~/lib/db";
import {
  mergeTermsOfService,
  resolveTemplate,
  type TermsOfServiceConfig,
} from "~/lib/policy-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Terms of Service",
    description: `Terms of Service for ${config.siteName}. Read the terms governing your use of our website and services.`,
  };
}

export default async function TermsOfServicePage() {
  const storeConfig = await getStoreConfig();
  const siteName = storeConfig.siteName;
  const policyTemplates = await getPolicyTemplates();
  const config: TermsOfServiceConfig = mergeTermsOfService(
    policyTemplates.terms_of_service as
      | Partial<TermsOfServiceConfig>
      | undefined,
  );

  const vars: Record<string, string> = {
    siteName,
    siteDomain: storeConfig.siteDomain,
    supportEmail: storeConfig.supportEmail,
    returnWindowDays: String(config.returnWindowDays),
    governingState: config.governingState,
  };
  const agreementText = resolveTemplate(config.agreementText, vars);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="text-secondary-400 container mx-auto px-4 py-4 font-mono text-xs tracking-wider">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="text-secondary-300 mx-2">/</span>
        <span className="text-secondary-500 font-medium">Terms of Service</span>
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
            Terms of <span className="text-primary-500">Service</span>
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
          {/* Agreement to Terms */}
          {config.showAgreementToTerms && (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Agreement to Terms
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 text-secondary-600 space-y-4 border p-8 leading-relaxed md:p-12">
                <p>{agreementText}</p>
                <p>
                  We reserve the right to update or modify these terms at any
                  time without prior notice. Your continued use of the website
                  following any changes indicates your acceptance of the new
                  terms.
                </p>
              </div>
            </section>
          )}

          {/* Use of Website */}
          {config.showUseOfWebsite && (
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Use of Website
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>
                  You agree to use our website only for lawful purposes. You
                  must not:
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "Use the site in any way that violates applicable federal, state, or local laws",
                    "Attempt to gain unauthorized access to any portion of the website or its systems",
                    "Use any automated system to access the website in a manner that sends more requests than a human could reasonably produce",
                    "Introduce viruses, trojans, worms, or other material that is malicious or harmful",
                    `Impersonate or attempt to impersonate ${siteName}, an employee, or another user`,
                    "Use the site to engage in any fraudulent activity",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-secondary-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Products & Orders */}
          {config.showProductsAndOrders && (
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Products & Orders
                </h2>
              </div>
              <div className="space-y-6">
                <div className="border-secondary-100 border bg-white p-8">
                  <h3 className="text-secondary-900 mb-4 text-lg font-bold">
                    Product Information
                  </h3>
                  <div className="text-secondary-600 space-y-3 text-sm leading-relaxed">
                    <p>
                      We strive to provide accurate product descriptions,
                      images, and pricing. However, we do not warrant that
                      product descriptions, images, pricing, or other content on
                      the site are accurate, complete, reliable, or error-free.
                    </p>
                    <p>
                      Product availability is subject to change without notice.
                      We reserve the right to limit quantities and to
                      discontinue any product at any time.
                    </p>
                  </div>
                </div>
                <div className="border-secondary-100 border bg-white p-8">
                  <h3 className="text-secondary-900 mb-4 text-lg font-bold">
                    Pricing & Payment
                  </h3>
                  <div className="text-secondary-600 space-y-3 text-sm leading-relaxed">
                    <p>
                      All prices are listed in US Dollars (USD). We reserve the
                      right to change prices at any time without notice. In the
                      event of a pricing error, we reserve the right to cancel
                      any orders placed at the incorrect price.
                    </p>
                    <p>
                      Payment is processed securely through Stripe. By placing
                      an order, you represent that you are authorized to use the
                      payment method provided.
                    </p>
                  </div>
                </div>
                <div className="border-secondary-100 border bg-white p-8">
                  <h3 className="text-secondary-900 mb-4 text-lg font-bold">
                    Ammunition Regulations
                  </h3>
                  <div className="text-secondary-600 space-y-3 text-sm leading-relaxed">
                    <p>
                      Ammunition and reloading components are subject to
                      federal, state, and local regulations. By placing an
                      order, you certify that you are legally permitted to
                      purchase ammunition and components in your jurisdiction
                      and that you are at least 18 years of age (21 for handgun
                      ammunition).
                    </p>
                    <p>
                      We reserve the right to cancel orders that cannot be
                      legally fulfilled due to shipping destination
                      restrictions.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Shipping & Returns */}
          {config.showShippingAndReturns && (
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Shipping & Returns
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 text-secondary-600 space-y-4 border p-8 leading-relaxed md:p-12">
                <p>
                  All ammunition and components are shipped via UPS Ground only.
                  Air shipping is not available for ammunition products due to
                  HAZMAT regulations. Delivery times are estimated and not
                  guaranteed.
                </p>
                <p>
                  Returns and exchanges are accepted within{" "}
                  {config.returnWindowDays} days of receipt. Items must be in
                  original, unopened condition with all original packaging.
                  Ammunition that has been opened or used cannot be returned.
                </p>
                <p className="text-sm">
                  For full details, please review our{" "}
                  <Link
                    href="/shipping-returns"
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Shipping, Returns & Exchanges Policy
                  </Link>
                  .
                </p>
              </div>
            </section>
          )}

          {/* Intellectual Property */}
          {config.showIntellectualProperty && (
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Intellectual Property
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>
                  All content on this website, including text, graphics, logos,
                  images, and software, is the property of {siteName} or its
                  content suppliers and is protected by United States and
                  international copyright laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, create derivative
                  works of, publicly display, or exploit any of the content on
                  our website without prior written permission from {siteName}.
                </p>
              </div>
            </section>
          )}

          {/* User Reviews */}
          {config.showUserReviews && (
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  User Reviews
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>
                  By submitting a review on our website, you grant {siteName} a
                  non-exclusive, royalty-free, perpetual, and worldwide license
                  to use, reproduce, modify, and display your review in
                  connection with our products and services.
                </p>
                <p>
                  Reviews must be honest, accurate, and not contain any
                  offensive, defamatory, or illegal content. We reserve the
                  right to remove any review that violates these guidelines
                  without prior notice.
                </p>
              </div>
            </section>
          )}

          {/* Limitation of Liability */}
          {config.showLimitationOfLiability && (
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Limitation of Liability
                </h2>
              </div>
              <div className="bg-secondary-50 border-secondary-100 text-secondary-600 space-y-4 border p-8 leading-relaxed md:p-12">
                <p>
                  To the fullest extent permitted by applicable law, {siteName}{" "}
                  shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited
                  to loss of profits, data, or goodwill, arising out of or in
                  connection with your use of our website or products.
                </p>
                <p>
                  Our total liability for any claim arising out of or relating
                  to these terms or our services shall not exceed the amount you
                  paid to us in the {config.liabilityPeriodMonths} months
                  preceding the claim.
                </p>
                <p className="text-secondary-500 text-sm">
                  Some jurisdictions do not allow the exclusion of certain
                  warranties or limitation of liability, so the above
                  limitations may not apply to you.
                </p>
              </div>
            </section>
          )}

          {/* Governing Law */}
          {config.showGoverningLaw && (
            <section>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <h3 className="text-secondary-900 mb-3 text-lg font-bold">
                  Governing Law
                </h3>
                <p>
                  These Terms of Service shall be governed by and construed in
                  accordance with the laws of the State of{" "}
                  {config.governingState}, without regard to its conflict of law
                  provisions. Any disputes arising from these terms or your use
                  of our website shall be resolved in the courts located in{" "}
                  {config.governingCounty}, {config.governingState}.
                </p>
              </div>
            </section>
          )}

          {/* Severability */}
          {config.showSeverability && (
            <section>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <h3 className="text-secondary-900 mb-3 text-lg font-bold">
                  Severability
                </h3>
                <p>
                  If any provision of these Terms of Service is found to be
                  unenforceable or invalid, that provision will be limited or
                  eliminated to the minimum extent necessary so that the
                  remaining terms will remain in full force and effect.
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
