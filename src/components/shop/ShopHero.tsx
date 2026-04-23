import Link from "next/link";
import Image from "next/image";
import type { CategoryWithChildren } from "~/types";

const CATEGORY_IMAGE_MAP: { keyword: string; src: string }[] = [
  { keyword: "bleeding", src: "/images/hero/hero-bandage.jpg" },
  { keyword: "training", src: "/images/hero/hero-cpr-training.jpg" },
  { keyword: "trauma", src: "/images/hero/kit-contents.png" },
  { keyword: "cpr", src: "/images/hero/cpr-mask-kit.png" },
  { keyword: "first aid", src: "/images/hero/kit-red-bag.png" },
];
const DEFAULT_TILE_IMAGE = "/images/hero/kit-full-spread.png";

function pickImage(name: string): string {
  const lower = name.toLowerCase();
  for (const { keyword, src } of CATEGORY_IMAGE_MAP) {
    if (lower.includes(keyword)) return src;
  }
  return DEFAULT_TILE_IMAGE;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface ShopHeroProps {
  categories: CategoryWithChildren[];
  totalProductCount: number;
}

// Action photo for the hero — chosen for atmosphere, not as a product shot.
// Product PNGs have white backgrounds that don't blend with the dark band.
const HERO_BACKDROP_IMAGE = "/images/hero/hero-first-aid-group.jpg";

export default function ShopHero({
  categories,
  totalProductCount,
}: ShopHeroProps) {
  const featured = categories.slice(0, 3);

  return (
    <section className="bg-secondary-950 relative overflow-hidden">
      {/* Ambient red glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 500px at 78% 30%, rgba(227,24,55,0.28) 0%, transparent 65%)",
        }}
      />

      {/* Atmospheric backdrop photo — fades from dark on the left to visible on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        <Image
          src={HERO_BACKDROP_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Dark gradient + red color grade — keeps left side legible, blends right side into the band */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(11,11,15,1) 35%, rgba(11,11,15,0.7) 60%, rgba(11,11,15,0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 700px 500px at 80% 40%, rgba(227,24,55,0.22) 0%, transparent 65%)",
          }}
        />
      </div>


      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-primary-400 font-mono text-[0.65rem] tracking-[0.3em] uppercase">
              Our Catalog &middot; {totalProductCount} Products
            </span>
          </div>
          <h1 className="font-display mb-5 text-4xl leading-[1.05] font-bold text-white md:text-6xl">
            Built for the worst day{" "}
            <span className="text-primary-400">on the job.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Trauma kits, bleeding control, and training gear &mdash; stocked
            the way professionals carry them. Supplies you actually need, when
            seconds matter.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#products"
              className="bg-primary-500 text-white hover:bg-primary-600 inline-flex items-center rounded-full px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors"
            >
              Browse All Products
            </a>
            <Link
              href="/services"
              className="border-primary-500/40 text-primary-300 hover:border-primary-500 hover:text-white inline-flex items-center rounded-full border px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors"
            >
              Need Training?
            </Link>
          </div>
        </div>
      </div>

      {/* Category tiles */}
      {featured.length > 0 && (
        <div className="relative z-10 container mx-auto max-w-6xl px-4 pb-12 md:pb-16">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Shop by Category
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((cat) => {
              const slug = slugify(cat.categoryName);
              const img = pickImage(cat.categoryName);
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${slug}`}
                  className="group bg-secondary-900 hover:border-primary-500/50 relative aspect-[5/3] overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(227,24,55,0.25)]"
                >
                  <Image
                    src={img}
                    alt={cat.categoryName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover opacity-55 transition-all duration-500 group-hover:scale-105 group-hover:opacity-75"
                  />
                  <div className="from-secondary-950 via-secondary-950/70 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <h3 className="font-display text-2xl leading-tight font-bold text-white md:text-[1.65rem]">
                      {cat.categoryName}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      {cat.productCount != null && cat.productCount > 0 && (
                        <span className="text-primary-300 font-mono text-[0.65rem] tracking-[0.2em] uppercase">
                          {cat.productCount} Product
                          {cat.productCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-primary-400 font-mono text-sm transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
