import type { PartnershipType } from '@/lib/types';

/** Legacy type labels kept for ApplicationForm / admin display. Prefer engagement modes for CTAs. */
export const PARTNERSHIP_OPTIONS: {
  type: PartnershipType;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    type: 'domain',
    title: 'Domain Partnership',
    description: 'Partner with premium domain assets and build brand value through equity-based collaboration.',
    href: '/apply?mode=domain_owner',
  },
  {
    type: 'apps',
    title: 'App Partnership',
    description: 'Collaborate on application development, distribution, and monetization.',
    href: '/apply?mode=app',
  },
  {
    type: 'leaders',
    title: 'Leader Partnership',
    description: 'Guide initiatives, mentor partners, and shape our collective future.',
    href: '/apply?mode=operator',
  },
  {
    type: 'product-service',
    title: 'Product & Service',
    description: 'Bring your products and services to market through our partnership channels.',
    href: '/apply?mode=vendor',
  },
];

export const PARTNERSHIP_LABELS: Record<PartnershipType, string> = {
  domain: 'Domain Partnership',
  apps: 'App Partnership',
  leaders: 'Leader Partnership',
  'product-service': 'Product/Service Partnership',
};
