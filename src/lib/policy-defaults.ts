/**
 * Policy template defaults for storefront rendering.
 * These defaults match the current hardcoded values in the policy pages.
 * When no config is saved in the DB, pages render identically to before.
 */

export interface ShippingReturnsConfig {
  heroSubtitle: string;
  contactCtaText: string;
  returnWindowDays: number;
  inspectionTimeHours: number;
  refundCreditDays: number;
  bankPostingDaysMin: number;
  bankPostingDaysMax: number;
  processingTimeDaysMin: number;
  processingTimeDaysMax: number;
  deliveryTimeDaysMin: number;
  deliveryTimeDaysMax: number;
  freeShipping: boolean;
  returnShippingPaidBy: "customer" | "store";
  shippingCarriers: string;
  shippingRegion: string;
  acceptPOBoxes: boolean;
  showReturnsExchanges: boolean;
  showPackaging: boolean;
  showShippingPolicy: boolean;
  showContactCta: boolean;
  showAmmoRestrictions: boolean;
}

export interface TermsOfServiceConfig {
  heroSubtitle: string;
  agreementText: string;
  contactCtaText: string;
  returnWindowDays: number;
  liabilityPeriodMonths: number;
  governingState: string;
  governingCounty: string;
  lastUpdatedDate: string;
  showAgreementToTerms: boolean;
  showUseOfWebsite: boolean;
  showProductsAndOrders: boolean;
  showShippingAndReturns: boolean;
  showIntellectualProperty: boolean;
  showUserReviews: boolean;
  showLimitationOfLiability: boolean;
  showGoverningLaw: boolean;
  showSeverability: boolean;
  showContactCta: boolean;
}

export interface PrivacyPolicyConfig {
  heroSubtitle: string;
  overviewText: string;
  contactCtaText: string;
  childrenMinAge: number;
  rightsResponseDays: number;
  lastUpdatedDate: string;
  showOverview: boolean;
  showInformationWeCollect: boolean;
  showHowWeUseInfo: boolean;
  showInformationSharing: boolean;
  showCookiesTracking: boolean;
  showDataSecurity: boolean;
  showYourRights: boolean;
  showChildrensPrivacy: boolean;
  showChangesToPolicy: boolean;
  showContactCta: boolean;
}

export const SHIPPING_RETURNS_DEFAULTS: ShippingReturnsConfig = {
  heroSubtitle:
    "Fast shipping on first aid kits and medical supplies with clear return and exchange policies.",
  contactCtaText:
    "Our support team is ready to help you with any shipping or return concerns.",
  returnWindowDays: 30,
  inspectionTimeHours: 72,
  refundCreditDays: 7,
  bankPostingDaysMin: 2,
  bankPostingDaysMax: 10,
  processingTimeDaysMin: 1,
  processingTimeDaysMax: 3,
  deliveryTimeDaysMin: 3,
  deliveryTimeDaysMax: 7,
  freeShipping: false,
  returnShippingPaidBy: "customer",
  shippingCarriers: "UPS and FedEx",
  shippingRegion: "continental United States",
  acceptPOBoxes: false,
  showReturnsExchanges: true,
  showPackaging: true,
  showShippingPolicy: true,
  showContactCta: true,
  showAmmoRestrictions: false,
};

export const TERMS_OF_SERVICE_DEFAULTS: TermsOfServiceConfig = {
  heroSubtitle:
    "Please read these terms carefully before using our website or services.",
  agreementText:
    "By accessing or using the {{siteName}} website at {{siteDomain}}, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are not authorized to use our site or services.",
  contactCtaText:
    "If you have any questions about these Terms of Service, please reach out to our team.",
  returnWindowDays: 30,
  liabilityPeriodMonths: 12,
  governingState: "Utah",
  governingCounty: "Salt Lake County",
  lastUpdatedDate: "March 10, 2026",
  showAgreementToTerms: true,
  showUseOfWebsite: true,
  showProductsAndOrders: true,
  showShippingAndReturns: true,
  showIntellectualProperty: true,
  showUserReviews: true,
  showLimitationOfLiability: true,
  showGoverningLaw: true,
  showSeverability: true,
  showContactCta: true,
};

export const PRIVACY_POLICY_DEFAULTS: PrivacyPolicyConfig = {
  heroSubtitle:
    "Your privacy matters to us. Here's how we handle your information.",
  overviewText:
    '{{siteName}} ("we," "us," or "our") operates the website {{siteDomain}}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.',
  contactCtaText:
    "If you have any questions about this Privacy Policy, please don't hesitate to reach out.",
  childrenMinAge: 18,
  rightsResponseDays: 30,
  lastUpdatedDate: "March 10, 2026",
  showOverview: true,
  showInformationWeCollect: true,
  showHowWeUseInfo: true,
  showInformationSharing: true,
  showCookiesTracking: true,
  showDataSecurity: true,
  showYourRights: true,
  showChildrensPrivacy: true,
  showChangesToPolicy: true,
  showContactCta: true,
};

/** Merge saved partial config with defaults */
export function mergeShippingReturns(
  saved?: Partial<ShippingReturnsConfig>,
): ShippingReturnsConfig {
  return { ...SHIPPING_RETURNS_DEFAULTS, ...(saved || {}) };
}

export function mergeTermsOfService(
  saved?: Partial<TermsOfServiceConfig>,
): TermsOfServiceConfig {
  return { ...TERMS_OF_SERVICE_DEFAULTS, ...(saved || {}) };
}

export function mergePrivacyPolicy(
  saved?: Partial<PrivacyPolicyConfig>,
): PrivacyPolicyConfig {
  return { ...PRIVACY_POLICY_DEFAULTS, ...(saved || {}) };
}

/** Simple {{var}} replacement */
export function resolveTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}
