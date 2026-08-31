import "server-only";
import {
  getVerticalBrandsByValue,
  getBrandByDomain,
  inferVerticalForBrand,
  searchBrandsByQuery,
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
  const q = (opts?.q || "").trim();
  const verticalSlug = opts?.verticalSlug;

  if (q) {
    const brands = await searchBrandsByQuery(q, Math.max(limit, 36));
    const merged: OpportunityCard[] = [];
    for (const b of brands) {
      const vertical = inferVerticalForBrand(b.categoryId, b.domainName);
      if (verticalSlug && vertical.slug !== verticalSlug) continue;
      merged.push({
        ...b,
        verticalSlug: vertical.slug,
        verticalName: vertical.name,
      });
    }
    return merged.slice(0, limit);
  }

  const verticals = verticalSlug
    ? VERTICALS.filter((v) => v.slug === verticalSlug)
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

  const brand = await getBrandByDomain(host);
  if (!brand) return null;

  const vertical = inferVerticalForBrand(brand.categoryId, brand.domainName);
  return {
    ...brand,
    verticalSlug: vertical.slug,
    verticalName: vertical.name,
  };
}

export { formatDomainDisplay, formatBrandValue, formatBrandStat };
