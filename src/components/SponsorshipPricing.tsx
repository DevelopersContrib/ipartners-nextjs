import Link from "next/link";
import { SAMPLE_REPORT_HREF } from "@/content/marketing-proof";
import { sponsorCheckoutHref } from "@/lib/sponsor-pricing";

type TierFeature =
  | { kind: "text"; text: string }
  | { kind: "report"; text: string; href: string };

const TIERS: {
  tier: string;
  price: string;
  period: string;
  tagline: string;
  features: TierFeature[];
  featured: boolean;
}[] = [
  {
    tier: "Bronze",
    price: "$500",
    period: "/ year",
    tagline: "Get in front of buyers in your category.",
    features: [
      {
        kind: "text",
        text: "Brand placement on category pages in one vertical",
      },
      {
        kind: "text",
        text: "Product or service listing in relevant project types",
      },
      {
        kind: "text",
        text: "Logo, link, and description on partner placements",
      },
      {
        kind: "text",
        text: "Listed on the vertical page once your sponsorship is live",
      },
    ],
    featured: false,
  },
  {
    tier: "Silver",
    price: "$2,500",
    period: "/ year",
    tagline: "Own the category, and see what it's doing.",
    features: [
      { kind: "text", text: "Everything in Bronze" },
      {
        kind: "text",
        text: "Placement across every active domain in your vertical — 250–650 sites",
      },
      {
        kind: "text",
        text: "First-position logo slot where a domain carries several partners",
      },
      {
        kind: "report",
        text: "Monthly report: visitors, impressions, clicks, top queries",
        href: SAMPLE_REPORT_HREF,
      },
      { kind: "text", text: "Priority review and one newsletter inclusion" },
    ],
    featured: false,
  },
  {
    tier: "Gold",
    price: "$10,000",
    period: "/ year",
    tagline: "Be the only one in your category.",
    features: [
      {
        kind: "text",
        text: "Category exclusivity — for the full term, we sell no placement in your vertical to a direct competitor.",
      },
      { kind: "text", text: "Everything in Silver" },
      { kind: "text", text: "Placement on the premium names in your vertical" },
      { kind: "text", text: "Co-branded landing page on a premium domain" },
      {
        kind: "text",
        text: "Named account manager, quarterly review on real data",
      },
      { kind: "text", text: "API access and first look at new acquisitions" },
    ],
    featured: true,
  },
];

export default function SponsorshipPricing() {
  return (
    <section id="sponsorship" className="ipp-band ipp-band-a scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          Sponsorship
        </p>
        <h2 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)]">
          Three tiers.{" "}
          <span className="text-[var(--ipp-accent)]">Billed annually.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--ipp-secondary)] leading-relaxed">
          Bronze puts you in the category. Silver puts you across it, with the
          numbers to prove it. Gold makes sure no one else is there. Checkout
          via PayDirect (card or crypto).
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
                <span className="ms-1 text-base font-semibold tracking-normal text-[var(--ipp-secondary)]">
                  {t.period}
                </span>
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--ipp-text)] leading-snug">
                {t.tagline}
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li
                    key={f.text}
                    className="flex gap-2.5 text-sm text-[var(--ipp-secondary)] leading-relaxed"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ipp-accent)]"
                      aria-hidden
                    />
                    {f.kind === "report" ? (
                      <span>
                        <Link
                          href={f.href}
                          className="font-semibold text-[var(--ipp-primary)] underline underline-offset-2 hover:text-[var(--ipp-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
                        >
                          Monthly report
                        </Link>
                        {": visitors, impressions, clicks, top queries"}{" "}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning)]">
                          (sample)
                        </span>
                      </span>
                    ) : (
                      <span>{f.text}</span>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href={sponsorCheckoutHref({ tier: t.tier.toLowerCase() })}
                className={`mt-8 inline-flex items-center justify-center min-h-12 px-5 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)] ${
                  t.featured
                    ? "bg-[var(--ipp-accent)] text-[var(--ipp-text)] hover:brightness-105"
                    : "bg-[var(--ipp-primary)] text-white hover:opacity-90"
                }`}
              >
                Checkout
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--ipp-secondary)] max-w-3xl leading-relaxed">
          Categories vary in size. We publish the domain count before you go
          live — no undisclosed inventory. Pay annually via PayDirect; your
          sponsorship engagement is approved when payment settles.{" "}
          <Link
            href={SAMPLE_REPORT_HREF}
            className="font-semibold text-[var(--ipp-primary)] underline underline-offset-2 hover:text-[var(--ipp-accent)]"
          >
            Preview the sample Silver monthly report
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
