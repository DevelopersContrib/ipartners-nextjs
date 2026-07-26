/**
 * Brands for vertical SEO pages — live inventory from domaindi_managedomain,
 * ranked by Theoretical Value then re-ranked by PartnerScore after analytics
 * enrich. Read-only; never writes managedomain tables.
 */
import { fetchDomainsTraffic } from "@/lib/analytics-vnoc";
import { prisma } from "@/lib/db";
import {
  computePartnerScore,
  type PartnerScoreBand,
  type PartnerScoreBreakdown,
} from "@/lib/partner-score";

/** Same weight as manage-app TV_WEIGHTS.partner */
const TV_PARTNER_DOLLARS = 2000;

export type VerticalBrand = {
  domainName: string;
  /** Theoretical value total when present, else asking price */
  value: number;
  askingPrice: number | null;
  theoreticalTotal: number | null;
  categoryName: string | null;
  leads: number;
  offers: number;
  /** Derived from TV partners dollars ÷ $2,000 */
  partners: number;
  /** Legacy fallback visits (piwik / cached CF) when analytics missing */
  visits: number;
  uniqueVisitors7d: number;
  uniqueVisitors30d: number;
  pageviews7d: number;
  pageviews30d: number;
  partnerScore: number;
  partnerBand: PartnerScoreBand;
  partnerLabel: string;
  partnerBreakdown: PartnerScoreBreakdown;
};

type VerticalMatch = {
  /** domaindi_managedomain.category.category_id */
  categoryIds: number[];
  /** MySQL LIKE patterns against domain_name (OR’d) */
  namePatterns: string[];
};

/** Top brands shown per vertical SEO page. */
export const VERTICAL_BRANDS_LIMIT = 10;

/**
 * Map curated iPartner verticals → managedomain category + name filters.
 * Categories verified 2026-07 against domaindi_managedomain.category.
 */
const VERTICAL_MATCH: Record<string, VerticalMatch> = {
  ai: {
    categoryIds: [191], // Bot — Technology/Digital are too broad for this vertical
    namePatterns: ["%agent%", "ai.%", "%-ai.%", "%llm%", "%gpt%"],
  },
  domains: {
    categoryIds: [150, 142], // Domain, Directory/Guides
    namePatterns: ["%domain%", "%brand%"],
  },
  referrals: {
    categoryIds: [167], // Network
    namePatterns: ["%refer%", "%affiliate%", "%partner%"],
  },
  services: {
    categoryIds: [145], // Jobs/Services
    namePatterns: ["%service%", "%handyman%", "%local%"],
  },
  payments: {
    categoryIds: [],
    namePatterns: ["%pay%", "%wallet%", "%checkout%", "%billing%", "%payout%"],
  },
  health: {
    categoryIds: [173], // Health/Beauty/Fitness
    namePatterns: ["%health%", "%wellness%", "%fitness%", "%care%"],
  },
  "real-estate": {
    categoryIds: [154], // Realty/Home/Property
    namePatterns: ["%realty%", "%home%", "%property%", "%mortgage%"],
  },
  travel: {
    categoryIds: [176], // Travel/Tour
    namePatterns: ["%travel%", "%tour%", "%hotel%", "%vacation%"],
  },
  food: {
    categoryIds: [172], // Food/Beverage
    namePatterns: ["%food%", "%dining%", "%recipe%", "%restaurant%"],
  },
  education: {
    categoryIds: [164, 147], // Education, Student/College
    namePatterns: ["%edu%", "%learn%", "%course%", "%school%", "%college%"],
  },
  finance: {
    categoryIds: [165], // Finance/Commerce
    namePatterns: ["%finance%", "%invest%", "%fund%", "%bank%", "%money%"],
  },
  media: {
    categoryIds: [153, 174, 135], // Media/Video/Audio, News, Entertainment
    namePatterns: ["%media%", "%news%", "%content%", "%cast%"],
  },
  sports: {
    categoryIds: [183], // Sports
    namePatterns: ["%sport%", "%fitness%", "%athlete%"],
  },
  legal: {
    categoryIds: [189], // Consultants
    namePatterns: ["%legal%", "%law%", "%counsel%", "%compliance%"],
  },
  crypto: {
    categoryIds: [134, 191], // Digital/Virtual, Bot
    namePatterns: [
      "%crypto%",
      "%web3%",
      "%defi%",
      "%token%",
      "%nft%",
      "%dao%",
      "%blockchain%",
      "%chain.%",
    ],
  },
};

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export function formatBrandValue(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Normalize a bare hostname (no protocol / www / path). */
export function normalizeDomainHost(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/** Display form: capitalize SLD (Paydirect.com). */
export function formatDomainDisplay(domain: string): string {
  const host = normalizeDomainHost(domain);
  if (!host) return domain;
  const [sld, ...rest] = host.split(".");
  if (!sld) return host;
  const capped = sld.charAt(0).toUpperCase() + sld.slice(1);
  return rest.length ? `${capped}.${rest.join(".")}` : capped;
}

/**
 * Exact outbound domain URL, e.g. https://www.campuslinks.com/
 * Referral.js appends ?ref=<hostname>; we also set it for SSR/no-JS.
 */
export function domainHref(domain: string): string {
  const host = normalizeDomainHost(domain);
  return `https://www.${host}/`;
}

/**
 * Exact domain link + referral, e.g.
 * https://www.campuslinks.com/?ref=ipartner.com
 */
export function referralDomainHref(
  domain: string,
  refHost = process.env.NEXT_PUBLIC_DOMAIN || "ipartner.com",
): string {
  const host = normalizeDomainHost(domain);
  const ref = normalizeDomainHost(refHost) || "ipartner.com";
  return `https://www.${host}/?ref=${encodeURIComponent(ref)}`;
}

export function formatBrandStat(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value);
}

export async function getVerticalBrandsByValue(
  slug: string,
  limit = VERTICAL_BRANDS_LIMIT,
): Promise<{ brands: VerticalBrand[]; total: number }> {
  if (!process.env.CONTRIB_DATABASE_URL?.trim()) {
    return { brands: [], total: 0 };
  }

  const match = VERTICAL_MATCH[slug];
  if (!match) return { brands: [], total: 0 };

  const catIds = match.categoryIds.filter((id) => Number.isInteger(id) && id > 0);
  const patterns = match.namePatterns.filter((p) => /^[%a-z0-9.%-]+$/i.test(p));

  if (catIds.length === 0 && patterns.length === 0) {
    return { brands: [], total: 0 };
  }

  const whereParts: string[] = [
    `d.domain_status = 'active'`,
    `(d.sold IS NULL OR d.sold = 0)`,
    `(d.flag_delete IS NULL OR d.flag_delete = 0)`,
    `d.domain_name IS NOT NULL`,
    `d.domain_name != ''`,
  ];

  const orParts: string[] = [];
  if (catIds.length) {
    orParts.push(`d.category_id IN (${catIds.join(",")})`);
  }
  for (const pat of patterns) {
    orParts.push(`d.domain_name LIKE ${escapeSqlString(pat)}`);
  }
  whereParts.push(`(${orParts.join(" OR ")})`);

  const whereSql = whereParts.join(" AND ");
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 1000);

  type Row = {
    domain_name: string;
    asking_price: number | null;
    theoretical_total: number | null;
    category_name: string | null;
    value: number;
    leads: number | null;
    offers: number | null;
    partners_dollars: number | null;
    piwik_visits: number | null;
    cf_visitors: number | null;
  };

  let rows: Row[] = [];
  let total = 0;
  try {
    const [rawRows, countRows] = await Promise.all([
      prisma.$queryRawUnsafe<Row[]>(`
      SELECT
        d.domain_name,
        d.price AS asking_price,
        d.leads,
        d.offers,
        d.piwik_visits,
        d.cf_unique_visitors_30d AS cf_visitors,
        tv.total AS theoretical_total,
        tv.partners AS partners_dollars,
        c.category_name,
        COALESCE(tv.total, d.price, 0) AS value
      FROM domaindi_managedomain.domain d
      LEFT JOIN domaindi_managedomain.category c
        ON c.category_id = d.category_id
      LEFT JOIN (
        SELECT domain_id,
          MAX(total) AS total,
          MAX(partners) AS partners
        FROM domaindi_managedomain.domain_theoretical_value
        GROUP BY domain_id
      ) tv ON tv.domain_id = d.domain_id
      WHERE ${whereSql}
      ORDER BY value DESC, d.domain_name ASC
      LIMIT ${safeLimit}
    `),
      prisma.$queryRawUnsafe<[{ c: bigint | number }]>(`
      SELECT COUNT(*) AS c
      FROM domaindi_managedomain.domain d
      WHERE ${whereSql}
    `),
    ]);
    rows = rawRows;
    total = n(countRows[0]?.c);
  } catch (err) {
    console.error("[vertical-brands] query failed:", err);
    return { brands: [], total: 0 };
  }

  const base = rows.map((r) => {
    const partnersDollars = n(r.partners_dollars);
    return {
      domainName: String(r.domain_name),
      value: n(r.value),
      askingPrice: r.asking_price != null ? n(r.asking_price) : null,
      theoreticalTotal: r.theoretical_total != null ? n(r.theoretical_total) : null,
      categoryName: r.category_name ? String(r.category_name) : null,
      leads: n(r.leads),
      offers: n(r.offers),
      partners:
        partnersDollars > 0 ? Math.round(partnersDollars / TV_PARTNER_DOLLARS) : 0,
      visits: Math.max(n(r.piwik_visits), n(r.cf_visitors)),
    };
  });

  const traffic = await fetchDomainsTraffic(base.map((b) => b.domainName));

  const brands: VerticalBrand[] = base
    .map((b) => {
      const t = traffic.get(b.domainName.toLowerCase());
      const uv7 = t?.uniqueVisitors7d ?? 0;
      const uv30 = t?.uniqueVisitors30d ?? (b.visits || 0);
      const pv7 = t?.pageviews7d ?? 0;
      const pv30 = t?.pageviews30d ?? 0;
      const scored = computePartnerScore({
        uniqueVisitors7d: uv7,
        uniqueVisitors30d: uv30,
        pageviews7d: pv7,
        pageviews30d: pv30,
        partners: b.partners,
        leads: b.leads,
        offers: b.offers,
        theoreticalValue: b.theoreticalTotal ?? b.value,
        askingPrice: b.askingPrice,
      });
      return {
        ...b,
        uniqueVisitors7d: uv7,
        uniqueVisitors30d: uv30,
        pageviews7d: pv7,
        pageviews30d: pv30,
        partnerScore: scored.partnerScore,
        partnerBand: scored.band,
        partnerLabel: scored.label,
        partnerBreakdown: scored.breakdown,
      };
    })
    .sort(
      (a, b) =>
        b.partnerScore - a.partnerScore ||
        b.value - a.value ||
        a.domainName.localeCompare(b.domainName),
    );

  return { brands, total };
}

/** Escape a string literal for embedding in raw SQL (patterns are allowlisted). */
function escapeSqlString(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}
