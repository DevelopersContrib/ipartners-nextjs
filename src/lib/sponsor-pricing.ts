/** Client-safe sponsor pricing (annual USD). */

export const SPONSOR_TIER_PRICES_USD = {
  bronze: "500.00",
  silver: "2500.00",
  gold: "10000.00",
} as const;

export type PricedSponsorTier = keyof typeof SPONSOR_TIER_PRICES_USD;

export function sponsorTierAmount(tier: string): string | null {
  const key = tier.trim().toLowerCase() as PricedSponsorTier;
  return SPONSOR_TIER_PRICES_USD[key] ?? null;
}

/** Display helper: "500.00" → "$500". */
export function formatSponsorPrice(tier: PricedSponsorTier): string {
  return `$${Number(SPONSOR_TIER_PRICES_USD[tier]).toLocaleString("en-US")}`;
}

/**
 * A sponsorship always runs somewhere: across a whole category (every active
 * site in the vertical) or on one premium domain. Scope changes what the tier
 * buys, never the annual price.
 */
export const SPONSOR_SCOPES = ["vertical", "domain"] as const;
export type SponsorScope = (typeof SPONSOR_SCOPES)[number];

export function isSponsorScope(v: string): v is SponsorScope {
  return (SPONSOR_SCOPES as readonly string[]).includes(v);
}

export const SPONSOR_SCOPE_LABELS: Record<SponsorScope, string> = {
  vertical: "Whole category",
  domain: "Single domain",
};

export const SPONSOR_SCOPE_HINTS: Record<SponsorScope, string> = {
  vertical: "Run across every active site in one vertical.",
  domain: "Run on one premium domain you choose.",
};

export type SponsorTierDetail = {
  tier: PricedSponsorTier;
  label: string;
  tagline: string;
  /** Bullets per scope — never promise category exclusivity on a single domain. */
  features: Record<SponsorScope, string[]>;
  /** Reporting cadence included at this tier. */
  reporting: string;
  recommended?: boolean;
};

export const SPONSOR_TIER_DETAILS: SponsorTierDetail[] = [
  {
    tier: "bronze",
    label: "Bronze",
    tagline: "Get in front of buyers in your category.",
    reporting: "Annual summary",
    features: {
      vertical: [
        "Brand placement on category pages in one vertical",
        "Product or service listing in relevant project types",
        "Logo, link, and description on partner placements",
        "Listed on the vertical page once your sponsorship is live",
      ],
      domain: [
        "Partner placement on the domain you choose",
        "Logo, link, and description in that partner slot",
        "Listed on the domain's partner widget once live",
        "Category context kept for reporting and matching",
      ],
    },
  },
  {
    tier: "silver",
    label: "Silver",
    tagline: "Own the placement, and see what it's doing.",
    reporting: "Monthly report",
    recommended: true,
    features: {
      vertical: [
        "Everything in Bronze",
        "Placement across every active site in your vertical",
        "First-position logo slot where a site carries several partners",
        "Monthly report: visitors, impressions, clicks, top queries",
        "Priority review and one newsletter inclusion",
      ],
      domain: [
        "Everything in Bronze",
        "First-position logo slot on that domain",
        "Monthly report for that domain: visitors, impressions, clicks",
        "Priority review and one newsletter inclusion",
      ],
    },
  },
  {
    tier: "gold",
    label: "Gold",
    tagline: "Be the only one in your slot.",
    reporting: "Monthly report + quarterly review",
    features: {
      vertical: [
        "Category exclusivity — no direct competitor placement in your vertical for the term",
        "Everything in Silver",
        "Placement on the premium names in your vertical",
        "Co-branded landing page on a premium domain",
        "Named account manager, quarterly review on real data",
        "API access and first look at new acquisitions",
      ],
      domain: [
        "Sole partner slot on that domain for the term",
        "Everything in Silver",
        "Co-branded landing page on that domain",
        "Named account manager, quarterly review on real data",
        "API access and first look at new acquisitions",
      ],
    },
  },
];

export function sponsorTierDetail(tier: string): SponsorTierDetail | undefined {
  const key = tier.trim().toLowerCase();
  return SPONSOR_TIER_DETAILS.find((t) => t.tier === key);
}

/** Bare hostname, no protocol/path. Keeps checkout URLs and metadata clean. */
export function normalizeSponsorDomain(raw: string | null | undefined): string {
  const host = (raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/\.$/, "");
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(host) ? host : "";
}

export function sponsorCheckoutHref(opts: {
  tier: string;
  /** Category context — always sent, even for a single-domain placement. */
  vertical?: string | null;
  /** When set (and valid), checkout scopes the sponsorship to this domain. */
  domain?: string | null;
}): string {
  const sp = new URLSearchParams();
  sp.set("tier", opts.tier.trim().toLowerCase());
  if (opts.vertical?.trim()) sp.set("vertical", opts.vertical.trim());
  const domain = normalizeSponsorDomain(opts.domain);
  if (domain) {
    sp.set("scope", "domain");
    sp.set("domain", domain);
  }
  return `/checkout/sponsor?${sp.toString()}`;
}
