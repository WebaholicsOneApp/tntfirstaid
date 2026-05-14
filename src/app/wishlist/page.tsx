import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you've saved for later from TNT First Aid.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
