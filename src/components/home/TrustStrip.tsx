import TrustBadges from "~/components/checkout/TrustBadges";

export default function TrustStrip() {
  return (
    <section className="border-secondary-100 border-y bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <TrustBadges variant="strip" />
      </div>
    </section>
  );
}
