import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';
import { getPolicyTemplates } from '~/lib/db';
import {
  mergeShippingReturns,
  type ShippingReturnsConfig,
} from '~/lib/policy-defaults';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'Shipping, Returns & Exchanges',
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
    config.returnShippingPaidBy === 'customer'
      ? 'Customers will be responsible for all return shipping charges.'
      : 'Return shipping is covered by the store.';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary-800 font-medium">
          Shipping, Returns & Exchanges
        </span>
      </nav>

      {/* Hero Header */}
      <header className="bg-secondary-900 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Shipping, Returns &{' '}
            <span className="text-primary-500">Exchanges</span>
          </h1>
          <p className="text-secondary-400 max-w-2xl mx-auto text-lg">
            {config.heroSubtitle}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Ammunition Shipping Restrictions */}
          {config.showAmmoRestrictions && (
            <section id="ammo-restrictions" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-800">
                  Ammunition Shipping Restrictions
                </h2>
              </div>
              <div className="bg-amber-50 rounded-2xl p-8 md:p-12 border border-amber-200 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Ammunition and reloading components are classified as{' '}
                  <span className="font-bold text-secondary-800">
                    ORM-D / Limited Quantity
                  </span>{' '}
                  under DOT regulations. Please review the following restrictions
                  before placing your order:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Ground Only',
                      text: 'We ship via UPS Ground only. Air shipping is not available for ammunition or components due to HAZMAT regulations.',
                    },
                    {
                      label: 'State Restrictions',
                      text: 'Some states have restrictions on ammunition purchases. It is the buyer\'s responsibility to be aware of and comply with all applicable laws in their jurisdiction.',
                    },
                    {
                      label: 'Processing Time',
                      text: `Orders typically ship within ${config.processingTimeDaysMin}-${config.processingTimeDaysMax} business days. Custom or high-volume orders may require additional processing time.`,
                    },
                    {
                      label: 'Age Requirement',
                      text: 'You must be at least 18 years of age to purchase rifle and shotgun ammunition, and 21 years of age for handgun ammunition.',
                    },
                    {
                      label: 'Signature Required',
                      text: 'Some shipments may require an adult signature upon delivery depending on your state and local regulations.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 font-bold text-sm uppercase whitespace-nowrap mt-0.5">
                        {item.label}
                      </span>
                      <p className="text-gray-600 text-sm leading-relaxed">
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
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-800">
                  Returns & Exchanges
                </h2>
              </div>

              <div className="bg-secondary-50 rounded-2xl p-8 md:p-12 border border-secondary-100 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-secondary-800 mb-4">
                    {config.returnWindowDays} Day Returns & Exchanges
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    You may return or exchange any item(s) in its/their original
                    condition to{' '}
                    <span className="text-primary-600 font-bold">
                      {siteName}
                    </span>{' '}
                    for up to {config.returnWindowDays} days from receipt of
                    shipment.
                  </p>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Products must be in the condition you received them and in the
                    original box and/or packaging. Opened ammunition cannot be
                    returned.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-red-600 text-sm mb-3">
                      Important Note
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Ammunition or components that have been opened, used, or
                      are missing the factory packaging cannot be accepted for
                      refund or exchange under any circumstances.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-secondary-800 text-sm mb-3">
                      What Can Be Returned?
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Unopened brass, reamers, tools, and accessories in their
                      original packaging. Custom-order items are non-returnable.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-blue-600 text-sm mb-3">
                      Exchanges
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Need a different caliber or quantity? We offer hassle-free
                      exchanges within {config.returnWindowDays} days. Contact
                      our support team to initiate.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">{returnShipNote}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      To start a return or exchange, email{' '}
                      <a href={`mailto:${storeConfig.supportEmail}`} className="text-primary-600 font-semibold hover:underline">
                        {storeConfig.supportEmail}
                      </a>{' '}
                      or call{' '}
                      <a href={storeConfig.phoneHref} className="text-primary-600 font-semibold hover:underline">
                        {storeConfig.phone}
                      </a>{' '}
                      to request a Return Authorization.
                    </p>
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-8">
                  <h4 className="font-bold text-secondary-800 text-sm mb-4">
                    Refund Process
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Once your return is received and inspected by our warehouse
                    staff (usually within {config.inspectionTimeHours} hours of
                    receipt), we will process your refund and automatically apply
                    a credit to your credit or debit card within{' '}
                    {config.refundCreditDays} days.
                  </p>
                  <p className="text-gray-500 text-xs italic">
                    Please note that depending on your bank&apos;s policies, it
                    may take an additional {config.bankPostingDaysMin}-
                    {config.bankPostingDaysMax} business days after your credit is
                    applied for it to post to your account.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Packaging */}
          {config.showPackaging && (
            <section id="packaging" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-700 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-800">
                  Packaging
                </h2>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-secondary-100 leading-relaxed text-gray-600 space-y-4">
                <p>
                  Products must be returned in the original packaging. If the
                  item came in a box, it must be returned in the same box. If the
                  item came in a sealed bag, it must be in the same sealed
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
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-secondary-800 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-800">
                  Shipping Policy
                </h2>
              </div>

              <div className="bg-secondary-50 rounded-2xl p-8 md:p-12 border border-secondary-100 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-secondary-800 mb-4">
                    {config.freeShipping
                      ? 'Free Shipping on Every Order'
                      : 'Shipping Policy'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {config.freeShipping ? (
                      <>
                        All orders from{' '}
                        <span className="text-primary-600 font-bold">
                          {siteName}
                        </span>{' '}
                        include free standard ground shipping within the{' '}
                        {config.shippingRegion}.
                      </>
                    ) : (
                      <>
                        Orders from{' '}
                        <span className="text-primary-600 font-bold">
                          {siteName}
                        </span>{' '}
                        are shipped via {config.shippingCarriers} within the{' '}
                        {config.shippingRegion}.
                      </>
                    )}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-primary-600 text-sm mb-3">
                      Processing Time
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Orders are processed within{' '}
                      {config.processingTimeDaysMin}--
                      {config.processingTimeDaysMax} business days after payment
                      is confirmed. Weekend and holiday orders are processed the
                      next business day.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-secondary-800 text-sm mb-3">
                      Delivery Estimates
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Standard ground delivery within the{' '}
                      {config.shippingRegion} takes{' '}
                      {config.deliveryTimeDaysMin}--
                      {config.deliveryTimeDaysMax} business days after shipment.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-secondary-100">
                    <h4 className="font-bold text-blue-600 text-sm mb-3">
                      Carrier
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      All ammunition and component orders ship via UPS Ground.
                      Non-hazmat accessories may ship via other carriers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold text-secondary-800">
                        Order Tracking:
                      </span>{' '}
                      A tracking number is emailed to you once your order ships.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold text-secondary-800">
                        Shipping Region:
                      </span>{' '}
                      We currently ship to the {config.shippingRegion} only. We
                      do not ship to Alaska, Hawaii, U.S. territories, or
                      international addresses at this time.
                    </p>
                  </div>
                  {!config.acceptPOBoxes && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">
                        <span className="font-semibold text-secondary-800">
                          P.O. Boxes:
                        </span>{' '}
                        We are unable to ship ammunition to P.O. Box addresses
                        due to carrier restrictions. Please provide a physical
                        street address.
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold text-secondary-800">
                        Lost or Damaged Packages:
                      </span>{' '}
                      If your package arrives damaged or does not arrive, contact
                      us at{' '}
                      <a href={`mailto:${storeConfig.supportEmail}`} className="text-primary-600 font-semibold hover:underline">
                        {storeConfig.supportEmail}
                      </a>{' '}
                      or call{' '}
                      <a href={storeConfig.phoneHref} className="text-primary-600 font-semibold hover:underline">
                        {storeConfig.phone}
                      </a>{' '}
                      and we will work with the carrier to resolve the issue.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Support CTA */}
          {config.showContactCta && (
            <div className="bg-secondary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-6">
                  Still Have{' '}
                  <span className="text-primary-500">Questions?</span>
                </h2>
                <p className="text-secondary-400 mb-8 max-w-lg mx-auto">
                  {config.contactCtaText}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/contact"
                    className="px-8 py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-all text-sm uppercase tracking-widest"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/faq"
                    className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm uppercase tracking-widest border border-white/10"
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
