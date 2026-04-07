import CheckoutConfirmClient from "./CheckoutConfirmClient";

export default function CheckoutConfirmPage() {
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_CHECKOUT_BYPASS === "true";

  return <CheckoutConfirmClient devBypass={devBypass} />;
}
