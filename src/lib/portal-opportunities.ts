import "server-only";
import {
  getVerticalBrandsByValue,
  formatDomainDisplay,
  formatBrandValue,
  formatBrandStat,
  type VerticalBrand,
} from "@/lib/vertical-brands";
import { VERTICALS } from "@/lib/verticals";

export type OpportunityCard = VerticalBrand & {
  verticalSlug: string;
  verticalName: string;
};

/** Aggregate top brands across verticals for Discover / Home matches. */
export async function getDiscoverOpportunities(opts?: {
  limit?: number;
  verticalSlug?: string;
  q?: string;
}): Promise<OpportunityCard[]> {
  const limit = opts?.limit ?? 24;
  const q = (opts?.q || "").trim().toLowerCase();
  const verticals = opts?.verticalSlug
    ? VERTICALS.filter((v) => v.slug === opts.verticalSlug)
    : VERTICALS;

  const perVertical = Math.max(4, Math.ceil(limit / Math.max(verticals.length, 1)));
  const batches = await Promise.all(
    verticals.map(async (v) => {
      const { brands } = await getVerticalBrandsByValue(v.slug, perVertical);
      return brands.map((b) => ({
        ...b,
        verticalSlug: v.slug,
        verticalName: v.name,
      }));
    }),
  );

  const seen = new Set<string>();
  const merged: OpportunityCard[] = [];
  for (const batch of batches) {
    for (const b of batch) {
      const key = b.domainName.toLowerCase();
      if (seen.has(key)) continue;
      if (q && !key.includes(q) && !(b.categoryName || "").toLowerCase().includes(q)) {
        continue;
      }
      seen.add(key);
      merged.push(b);
    }
  }

  merged.sort(
    (a, b) =>
      b.partnerScore - a.partnerScore ||
      b.value - a.value ||
      a.domainName.localeCompare(b.domainName),
  );

  return merged.slice(0, limit);
}

export async function getOpportunityByDomain(
  domain: string,
): Promise<OpportunityCard | null> {
  const host = domain.trim().toLowerCase().replace(/^www\./, "");
  if (!host) return null;

  // Search a few verticals until we find the domain (or fall back to first hit list).
  for (const v of VERTICALS) {
    const { brands } = await getVerticalBrandsByValue(v.slug, 40);
    const hit = brands.find((b) => b.domainName.toLowerCase() === host);
    if (hit) {
      return { ...hit, verticalSlug: v.slug, verticalName: v.name };
    }
  }

  // Lightweight stub when not in top lists — still apply-able.
  return {
    domainName: host,
    value: 0,
    askingPrice: null,
    theoreticalTotal: null,
    categoryName: null,
    leads: 0,
    offers: 0,
    partners: 0,
    visits: 0,
    uniqueVisitors7d: 0,
    uniqueVisitors30d: 0,
    pageviews7d: 0,
    pageviews30d: 0,
    partnerScore: 0,
    partnerBand: "emerging",
    partnerLabel: "Emerging",
    partnerBreakdown: {
      traffic: 0,
      network: 0,
      demand: 0,
      asset: 0,
    },
    verticalSlug: "domains",
    verticalName: "Domains & Brands",
  };
}

export { formatDomainDisplay, formatBrandValue, formatBrandStat };
