import CheckoutPaymentClient from './CheckoutPaymentClient';

export default function CheckoutPaymentPage() {
  const devBypass =
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_CHECKOUT_BYPASS === 'true';

  return <CheckoutPaymentClient devBypass={devBypass} />;
}
