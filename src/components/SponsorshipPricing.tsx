import Link from "next/link";

const TIERS = [
  {
    tier: "Bronze",
    price: "$500",
    period: "/ year",
    tagline: "Get in front of buyers in your category.",
    features: [
      "Brand placement on category pages in one vertical",
      "Product or service listing in relevant project types",
      "Logo, link, and description on partner placements",
      "Listing in the public partner directory",
    ],
    featured: false,
  },
  {
    tier: "Silver",
    price: "$2,500",
    period: "/ year",
    tagline: "Own the category, and see what it's doing.",
    features: [
      "Everything in Bronze",
      "Placement across every active domain in your vertical — 250–650 sites",
      "First-position logo slot where a domain carries several partners",
      "Monthly report: visitors, impressions, clicks, top queries",
      "Priority review and one newsletter inclusion",
    ],
    featured: false,
  },
  {
    tier: "Gold",
    price: "$10,000",
    period: "/ year",
    tagline: "Be the only one in your category.",
    features: [
      "Category exclusivity — for the full term, we sell no placement in your vertical to a direct competitor.",
      "Everything in Silver",
      "Placement on the premium names in your vertical",
      "Co-branded landing page on a premium domain",
      "Named account manager, quarterly review on real data",
      "API access and first look at new acquisitions",
    ],
    featured: true,
  },
] as const;

export default function SponsorshipPricing() {
  return (
    <section className="ipp-band ipp-band-a">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          Sponsorship
        </p>
        <h2 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)]">
          Three tiers.{" "}
          <span className="text-[var(--ipp-accent)]">Billed annually.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--ipp-secondary)] leading-relaxed">
          Bronze puts you in the category. Silver puts you across it, with the numbers to prove it.
          Gold makes sure no one else is there.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {TIERS.map((t) => (
            <article
              key={t.tier}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 transition ${
                t.featured
                  ? "border-[var(--ipp-accent)] bg-white shadow-sm ring-1 ring-[var(--ipp-accent)]/30"
                  : "border-[var(--border)] bg-white/90 hover:bg-white hover:border-[var(--ipp-accent)]/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ipp-accent)] font-semibold">
                  {t.tier}
                </p>
                {t.featured && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-[var(--ipp-accent)] text-[var(--ipp-text)]">
                    Exclusive
                  </span>
                )}
              </div>
              <p className="ipp-loud mt-3 text-4xl sm:text-5xl text-[var(--ipp-text)]">
                {t.price}
                <span className="ml-1 text-base font-semibold tracking-normal text-[var(--ipp-secondary)]">
                  {t.period}
                </span>
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--ipp-text)] leading-snug">
                {t.tagline}
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-[var(--ipp-secondary)] leading-relaxed">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ipp-accent)]"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/apply?mode=sponsor&tier=${t.tier.toLowerCase()}`}
                className={`mt-8 inline-flex items-center justify-center min-h-12 px-5 rounded-xl font-semibold transition ${
                  t.featured
                    ? "bg-[var(--ipp-accent)] text-[var(--ipp-text)] hover:brightness-105"
                    : "bg-[var(--ipp-primary)] text-white hover:opacity-90"
                }`}
              >
                I&apos;m interested
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--ipp-secondary)] max-w-3xl leading-relaxed">
          Categories vary in size. We publish the domain count before you sign — no undisclosed
          inventory. Apply to reserve interest; checkout comes next. Until then, every Gold seat
          shows as <span className="font-medium text-[var(--ipp-text)]">available</span>.
        </p>
      </div>
    </section>
  );
}
