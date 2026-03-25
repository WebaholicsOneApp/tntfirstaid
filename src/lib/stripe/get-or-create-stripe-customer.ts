/**
 * Finds or creates a Stripe Customer from our Customer profile.
 * Accepts a Stripe instance as a parameter (route-specific lazy init).
 * Never throws — returns null on failure so the caller falls back to guest checkout.
 */
import type Stripe from 'stripe';
import type { Customer } from '~/types/auth';

/**
 * Map our Customer + defaultAddress into the Stripe shipping format.
 */
function buildShipping(customer: Customer): Stripe.CustomerCreateParams['shipping'] | undefined {
  const addr = customer.defaultAddress;
  if (!addr?.line1) return undefined;

  return {
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    address: {
      line1: addr.line1,
      line2: addr.line2 || undefined,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postalCode,
      country: addr.country || 'US',
    },
  };
}

/**
 * Look up an existing Stripe customer by email, or create a new one.
 * Always updates the profile on the Stripe side so name/phone/address stay current.
 */
export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  customer: Customer,
): Promise<string | null> {
  try {
    const name = `${customer.firstName} ${customer.lastName}`.trim();
    const shipping = buildShipping(customer);

    // Check for an existing Stripe customer with this email
    const existing = await stripe.customers.list({
      email: customer.email,
      limit: 1,
    });

    const stripeCustomer = existing.data[0];
    if (stripeCustomer) {
      // Update profile so Stripe always has the latest info
      await stripe.customers.update(stripeCustomer.id, {
        name,
        phone: customer.phone || undefined,
        shipping,
      });
      return stripeCustomer.id;
    }

    // No existing customer — create one
    const created = await stripe.customers.create({
      email: customer.email,
      name,
      phone: customer.phone || undefined,
      shipping,
    });

    return created.id;
  } catch {
    // Stripe lookup/creation failed — fall back to guest checkout
    return null;
  }
}
