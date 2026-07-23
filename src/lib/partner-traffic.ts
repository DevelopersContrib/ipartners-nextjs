import "server-only";

/**
 * 30-day traffic for a partner's domains, from analytics.vnoc.com.
 *
 * POST /api/bulk-stats { domains: [...] } → { results: { [domain]: {
 *   visitors_30d, pageviews_30d, realtime, status, dashboard_url, … } } }
 * (≤500 domains per request; we stay far under that.)
 *
 * The dashboard must render fine without this — any failure returns {} and
 * the traffic chips simply don't appear. Never let analytics block the portal.
 */

export type DomainTraffic = {
  visitors30d: number;
  pageviews30d: number;
};

const ANALYTICS_URL = (process.env.VNOC_ANALYTICS_URL || "https://analytics.vnoc.com").replace(/\/$/, "");

export async function getTrafficForDomains(
  domains: string[]
): Promise<Record<string, DomainTraffic>> {
  const key = process.env.VNOC_ANALYTICS_KEY;
  const unique = [...new Set(domains.map((d) => d.trim().toLowerCase()).filter((d) => d.includes(".")))].slice(0, 100);
  if (!key || unique.length === 0) return {};

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${ANALYTICS_URL}/api/bulk-stats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domains: unique }),
      signal: controller.signal,
      // Traffic moves slowly; don't re-hit the worker on every portal load.
      next: { revalidate: 600 },
    });
    clearTimeout(timer);
    if (!res.ok) return {};

    const data = (await res.json()) as {
      results?: Record<string, { visitors_30d?: number; pageviews_30d?: number }>;
    };
    const out: Record<string, DomainTraffic> = {};
    for (const [domain, r] of Object.entries(data.results ?? {})) {
      out[domain.toLowerCase()] = {
        visitors30d: Number(r.visitors_30d) || 0,
        pageviews30d: Number(r.pageviews_30d) || 0,
      };
    }
    return out;
  } catch (err) {
    console.error("[partner-traffic] bulk-stats failed:", err instanceof Error ? err.message : err);
    return {};
  }
}

/** 4,852 → "4.9k" — compact enough for a chip. */
export function formatVisitors(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}
