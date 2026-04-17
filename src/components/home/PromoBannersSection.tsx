import Image from "next/image";
import Link from "next/link";

const BANNERS = [
  {
    src: "/images/old-site/banner-left-30off.jpg",
    alt: "Medical Supplies — 30% Off",
    href: "/shop",
    colClass: "md:col-span-1",
    aspect: "aspect-[27/37]",
  },
  {
    src: "/images/old-site/banner-middle.jpg",
    alt: "Free Shipping over $99 — Shop Now",
    href: "/shop",
    colClass: "md:col-span-2",
    aspect: "aspect-[57/37]",
  },
  {
    src: "/images/old-site/banner-right.jpg",
    alt: "Amazing Collection — Check Our Discounts",
    href: "/shop",
    colClass: "md:col-span-1",
    aspect: "aspect-[27/37]",
  },
];

export default function PromoBannersSection() {
  return (
    <section aria-label="Promotional banners" className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[108rem] px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
          {BANNERS.map((b) => (
            <Link
              key={b.src}
              href={b.href}
              className={`group relative block overflow-hidden rounded-xl ${b.colClass} ${b.aspect}`}
              aria-label={b.alt}
            >
              <Image
                src={b.src}
                alt={b.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(min-width: 768px) 25vw, 100vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
