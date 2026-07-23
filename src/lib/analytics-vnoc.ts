/**
 * Read-only client for analytics.vnoc.com (same worker as manage-app).
 * Auth: Bearer VNOC_ANALYTICS_KEY
 */

const BASE = process.env.VNOC_ANALYTICS_URL ?? "https://analytics.vnoc.com";
const KEY = process.env.VNOC_ANALYTICS_KEY ?? "";

export type DomainTrafficStats = {
  domain: string;
  uniqueVisitors7d: number;
  uniqueVisitors30d: number;
  pageviews7d: number;
  pageviews30d: number;
  source7d: string | null;
  source30d: string | null;
};

type RawStats = {
  domain?: string;
  period?: string;
  pageviews?: number;
  unique_visitors?: number;
  source?: string;
};

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
}

async function fetchPeriod(
  domain: string,
  period: "7d" | "30d",
): Promise<RawStats | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `${BASE}/api/stats?domain=${encodeURIComponent(domain)}&period=${period}`,
      {
        headers: { Authorization: `Bearer ${KEY}` },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as RawStats;
  } catch {
    return null;
  }
}

/** Live UV/PV for 7d + 30d from analytics.vnoc.com. */
export async function fetchDomainTraffic(
  domain: string,
): Promise<DomainTrafficStats | null> {
  const host = domain.trim().toLowerCase();
  if (!host || !KEY) return null;

  const [s7, s30] = await Promise.all([
    fetchPeriod(host, "7d"),
    fetchPeriod(host, "30d"),
  ]);
  if (!s7 && !s30) return null;

  return {
    domain: host,
    uniqueVisitors7d: n(s7?.unique_visitors),
    uniqueVisitors30d: n(s30?.unique_visitors),
    pageviews7d: n(s7?.pageviews),
    pageviews30d: n(s30?.pageviews),
    source7d: s7?.source ?? null,
    source30d: s30?.source ?? null,
  };
}

/**
 * Batch traffic for a small list (vertical top-10). Concurrency capped
 * so we don't stampede the analytics worker.
 */
export async function fetchDomainsTraffic(
  domains: string[],
  opts?: { concurrency?: number },
): Promise<Map<string, DomainTrafficStats>> {
  const out = new Map<string, DomainTrafficStats>();
  if (!KEY || domains.length === 0) return out;

  const unique = [
    ...new Set(domains.map((d) => d.trim().toLowerCase()).filter(Boolean)),
  ];
  const concurrency = Math.min(Math.max(opts?.concurrency ?? 5, 1), 10);

  for (let i = 0; i < unique.length; i += concurrency) {
    const chunk = unique.slice(i, i + concurrency);
    const settled = await Promise.all(
      chunk.map(async (domain) => {
        const stats = await fetchDomainTraffic(domain);
        return { domain, stats };
      }),
    );
    for (const { domain, stats } of settled) {
      if (stats) out.set(domain, stats);
    }
  }
  return out;
}

export function analyticsConfigured(): boolean {
  return Boolean(KEY);
}
