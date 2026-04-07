import type { Metadata } from "next";
import CartPageClient from "~/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | Alpha Munitions",
  description: "Review your cart items and proceed to checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
