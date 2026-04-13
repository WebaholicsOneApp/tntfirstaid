import type { Metadata } from "next";
import Link from "next/link";
import { getStoreConfig } from "~/lib/store-config.server";
import { getPolicyTemplates } from "~/lib/db";
import {
  mergeShippingReturns,
  type ShippingReturnsConfig,
} from "~/lib/policy-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "Shipping, Returns & Exchanges",
    description: `Shipping, return, and exchange policies at ${config.siteName}. Includes ammunition shipping restrictions and ORM-D requirements.`,
  };
}

export default async function ShippingReturnsPage() {
  const storeConfig = await getStoreConfig();
  const siteName = storeConfig.siteName;
  const policyTemplates = await getPolicyTemplates();
  const config: ShippingReturnsConfig = mergeShippingReturns(
    policyTemplates.shipping_returns as
      | Partial<ShippingReturnsConfig>
      | undefined,
  );

  const returnShipNote =
    config.returnShippingPaidBy === "customer"
      ? "Customers will be responsible for all return shipping charges."
      : "Return shipping is covered by the store.";

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="text-secondary-400 container mx-auto px-4 py-4 font-mono text-xs tracking-wider">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="text-secondary-300 mx-2">/</span>
        <span className="text-secondary-500 font-medium">
          Shipping, Returns & Exchanges
        </span>
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
            Shipping, Returns &{" "}
            <span className="text-primary-500">Exchanges</span>
          </h1>
          <p className="text-secondary-400 mx-auto max-w-2xl text-lg">
            {config.heroSubtitle}
          </p>
          <div className="via-primary-500/30 mx-auto mt-4 h-[1px] w-[80px] bg-gradient-to-r from-transparent to-transparent" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Ammunition Shipping Restrictions */}
          {config.showAmmoRestrictions && (
            <section id="ammo-restrictions" className="scroll-mt-48">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Ammunition Shipping Restrictions
                </h2>
              </div>
              <div className="space-y-6 border border-amber-200 bg-amber-50 p-8 md:p-12">
                <p className="text-secondary-700 leading-relaxed">
                  Ammunition and reloading components are classified as{" "}
                  <span className="text-secondary-800 font-bold">
                    ORM-D / Limited Quantity
                  </span>{" "}
                  under DOT regulations. Please review the following
                  restrictions before placing your order:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Ground Only",
                      text: "We ship via UPS Ground only. Air shipping is not available for ammunition or components due to HAZMAT regulations.",
                    },
                    {
                      label: "State Restrictions",
                      text: "Some states have restrictions on ammunition purchases. It is the buyer's responsibility to be aware of and comply with all applicable laws in their jurisdiction.",
                    },
                    {
                      label: "Processing Time",
                      text: `Orders typically ship within ${config.processingTimeDaysMin}-${config.processingTimeDaysMax} business days. Custom or high-volume orders may require additional processing time.`,
                    },
                    {
                      label: "Age Requirement",
                      text: "You must be at least 18 years of age to purchase rifle and shotgun ammunition, and 21 years of age for handgun ammunition.",
                    },
                    {
                      label: "Signature Required",
                      text: "Some shipments may require an adult signature upon delivery depending on your state and local regulations.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-xl border border-amber-100 bg-white p-5"
                    >
                      <span className="mt-0.5 text-sm font-bold whitespace-nowrap text-amber-600 uppercase">
                        {item.label}
                      </span>
                      <p className="text-secondary-600 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Returns & Exchanges */}
          {config.showReturnsExchanges && (
            <section id="refund-policy" className="scroll-mt-48">
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
                      d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Returns & Exchanges
                </h2>
              </div>

              <div className="bg-secondary-50 border-secondary-100 space-y-8 border p-8 md:p-12">
                <div>
                  <h3 className="text-secondary-800 mb-4 text-xl font-bold">
                    {config.returnWindowDays} Day Returns & Exchanges
                  </h3>
                  <p className="text-secondary-600 mb-4 leading-relaxed">
                    You may return or exchange any item(s) in its/their original
                    condition to{" "}
                    <span className="text-primary-600 font-bold">
                      {siteName}
                    </span>{" "}
                    for up to {config.returnWindowDays} days from receipt of
                    shipment.
                  </p>
                  <p className="text-secondary-600 leading-relaxed font-medium">
                    Products must be in the condition you received them and in
                    the original box and/or packaging. Opened ammunition cannot
                    be returned.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-primary-600 mb-3 text-sm font-bold">
                      Important Note
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      Ammunition or components that have been opened, used, or
                      are missing the factory packaging cannot be accepted for
                      refund or exchange under any circumstances.
                    </p>
                  </div>
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-secondary-800 mb-3 text-sm font-bold">
                      What Can Be Returned?
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      Unopened brass, reamers, tools, and accessories in their
                      original packaging. Custom-order items are non-returnable.
                    </p>
                  </div>
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-primary-600 mb-3 text-sm font-bold">
                      Exchanges
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      Need a different caliber or quantity? We offer hassle-free
                      exchanges within {config.returnWindowDays} days. Contact
                      our support team to initiate.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600">{returnShipNote}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600">
                      To start a return or exchange, email{" "}
                      <a
                        href={`mailto:${storeConfig.supportEmail}`}
                        className="text-primary-600 font-semibold hover:underline"
                      >
                        {storeConfig.supportEmail}
                      </a>{" "}
                      to request a Return Authorization.
                    </p>
                  </div>
                </div>

                <div className="border-secondary-200 border-t pt-8">
                  <h4 className="text-secondary-800 mb-4 text-sm font-bold">
                    Refund Process
                  </h4>
                  <p className="text-secondary-600 mb-4 text-sm leading-relaxed">
                    Once your return is received and inspected by our warehouse
                    staff (usually within {config.inspectionTimeHours} hours of
                    receipt), we will process your refund and automatically
                    apply a credit to your credit or debit card within{" "}
                    {config.refundCreditDays} days.
                  </p>
                  <p className="text-secondary-500 text-xs italic">
                    Please note that depending on your bank&apos;s policies, it
                    may take an additional {config.bankPostingDaysMin}-
                    {config.bankPostingDaysMax} business days after your credit
                    is applied for it to post to your account.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Packaging */}
          {config.showPackaging && (
            <section id="packaging" className="scroll-mt-48">
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Packaging
                </h2>
              </div>
              <div className="border-secondary-100 text-secondary-600 space-y-4 border bg-white p-8 leading-relaxed">
                <p>
                  Products must be returned in the original packaging. If the
                  item came in a box, it must be returned in the same box. If
                  the item came in a sealed bag, it must be in the same sealed
                  unopened bag.
                </p>
                <p>
                  Items must include all factory packaging and documentation.
                  Please do not write on the factory packaging and leave all
                  factory labels intact.
                </p>
              </div>
            </section>
          )}

          {/* Shipping Policy */}
          {config.showShippingPolicy && (
            <section id="shipping-policy" className="scroll-mt-48">
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-secondary-900 text-2xl font-bold md:text-3xl">
                  Shipping Policy
                </h2>
              </div>

              <div className="bg-secondary-50 border-secondary-100 space-y-8 border p-8 md:p-12">
                <div>
                  <h3 className="text-secondary-800 mb-4 text-xl font-bold">
                    {config.freeShipping
                      ? "Free Shipping on Every Order"
                      : "Shipping Policy"}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {config.freeShipping ? (
                      <>
                        All orders from{" "}
                        <span className="text-primary-600 font-bold">
                          {siteName}
                        </span>{" "}
                        include free standard ground shipping within the{" "}
                        {config.shippingRegion}.
                      </>
                    ) : (
                      <>
                        Orders from{" "}
                        <span className="text-primary-600 font-bold">
                          {siteName}
                        </span>{" "}
                        are shipped via {config.shippingCarriers} within the{" "}
                        {config.shippingRegion}.
                      </>
                    )}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-primary-600 mb-3 text-sm font-bold">
                      Processing Time
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      Orders are processed within {config.processingTimeDaysMin}
                      --
                      {config.processingTimeDaysMax} business days after payment
                      is confirmed. Weekend and holiday orders are processed the
                      next business day.
                    </p>
                  </div>
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-secondary-800 mb-3 text-sm font-bold">
                      Delivery Estimates
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      Standard ground delivery within the{" "}
                      {config.shippingRegion} takes {config.deliveryTimeDaysMin}
                      --
                      {config.deliveryTimeDaysMax} business days after shipment.
                    </p>
                  </div>
                  <div className="border-secondary-100 rounded-xl border bg-white p-6">
                    <h4 className="text-primary-600 mb-3 text-sm font-bold">
                      Carrier
                    </h4>
                    <p className="text-secondary-500 text-sm leading-relaxed">
                      All ammunition and component orders ship via UPS Ground.
                      Non-hazmat accessories may ship via other carriers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600">
                      <span className="text-secondary-800 font-semibold">
                        Order Tracking:
                      </span>{" "}
                      A tracking number is emailed to you once your order ships.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600">
                      <span className="text-secondary-800 font-semibold">
                        Shipping Region:
                      </span>{" "}
                      We currently ship to the {config.shippingRegion} only. We
                      do not ship to Alaska, Hawaii, U.S. territories, or
                      international addresses at this time.
                    </p>
                  </div>
                  {!config.acceptPOBoxes && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                      <p className="text-secondary-600">
                        <span className="text-secondary-800 font-semibold">
                          P.O. Boxes:
                        </span>{" "}
                        We are unable to ship ammunition to P.O. Box addresses
                        due to carrier restrictions. Please provide a physical
                        street address.
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500/10 text-primary-600 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600">
                      <span className="text-secondary-800 font-semibold">
                        Lost or Damaged Packages:
                      </span>{" "}
                      If your package arrives damaged or does not arrive,
                      contact us at{" "}
                      <a
                        href={`mailto:${storeConfig.supportEmail}`}
                        className="text-primary-600 font-semibold hover:underline"
                      >
                        {storeConfig.supportEmail}
                      </a>{" "}
                      and we will work with the carrier to resolve the issue.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Support CTA */}
          {config.showContactCta && (
            <div className="bg-secondary-900 relative overflow-hidden p-10 text-center md:p-16">
              <div className="border-primary-500/25 absolute top-6 left-6 h-8 w-8 border-t border-l" />
              <div className="border-primary-500/25 absolute top-6 right-6 h-8 w-8 border-t border-r" />
              <div className="border-primary-500/25 absolute bottom-6 left-6 h-8 w-8 border-b border-l" />
              <div className="border-primary-500/25 absolute right-6 bottom-6 h-8 w-8 border-r border-b" />
              <div className="relative z-10">
                <h2 className="font-display mb-6 text-2xl font-bold text-white md:text-4xl">
                  Still Have{" "}
                  <span className="text-primary-500">Questions?</span>
                </h2>
                <p className="text-secondary-400 mx-auto mb-8 max-w-lg">
                  {config.contactCtaText}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/contact"
                    className="group bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Contact Support
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
                  <Link
                    href="/faq"
                    className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 hover:text-primary-400 inline-flex items-center rounded-full border px-8 py-3.5 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Help Center
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
