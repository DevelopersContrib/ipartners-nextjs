import type { MetadataRoute } from 'next';
import { getAllVerticalSlugs } from '@/lib/verticals';
import { prisma } from '@/lib/db';

const BASE_URL = 'https://ipartner.com';

/**
 * Hard cap for domain URLs in the sitemap.
 * Keeps generation fast while covering the most valuable inventory.
 */
const DOMAIN_SITEMAP_LIMIT = 1000;

/**
 * Fetch top active domains from VNOC managedomain, ordered by
 * Theoretical Value descending. Read-only — no write, no local sync table.
 */
async function getActiveDomains(): Promise<string[]> {
  if (!process.env.CONTRIB_DATABASE_URL?.trim()) return [];

  try {
    type Row = { domain_name: string };
    const rows = await prisma.$queryRawUnsafe<Row[]>(`
      SELECT d.domain_name
      FROM domaindi_managedomain.domain d
      LEFT JOIN (
        SELECT domain_id, MAX(total) AS total
        FROM domaindi_managedomain.domain_theoretical_value
        GROUP BY domain_id
      ) tv ON tv.domain_id = d.domain_id
      WHERE d.domain_status = 'active'
        AND (d.sold IS NULL OR d.sold = 0)
        AND (d.flag_delete IS NULL OR d.flag_delete = 0)
        AND d.domain_name IS NOT NULL
        AND d.domain_name != ''
      ORDER BY COALESCE(tv.total, d.price, 0) DESC, d.domain_name ASC
      LIMIT ${DOMAIN_SITEMAP_LIMIT}
    `);
    return rows
      .map((r) => String(r.domain_name).trim().toLowerCase())
      .filter((d) => d && d.includes('.'));
  } catch (err) {
    console.error('[sitemap] domain query failed:', err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/verticals', priority: 0.95, changeFrequency: 'weekly' as const },
    { url: '/match', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/apply', priority: 0.95, changeFrequency: 'weekly' as const },
    { url: '/referrals', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/domain', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/apps', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/leaders', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/product-service', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/marketplace', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/sponsor', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/publisher', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  const verticalPages = getAllVerticalSlugs().map((slug) => ({
    url: `/verticals/${slug}`,
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  }));

  const domains = await getActiveDomains();
  const domainPages = domains.map((d) => ({
    url: `/d/${encodeURIComponent(d)}`,
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  }));

  return [...staticPages, ...verticalPages, ...domainPages].map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
