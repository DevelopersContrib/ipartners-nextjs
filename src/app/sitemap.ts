import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ipartner.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    // Partnership landing pages
    { url: '/domain', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/apps', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/leaders', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/product-service', priority: 0.9, changeFrequency: 'weekly' as const },
    // Apply pages
    { url: '/domain/apply', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/apps/apply', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/leaders/apply', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/product-service/apply', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
