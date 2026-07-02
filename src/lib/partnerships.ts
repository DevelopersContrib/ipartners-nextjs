import type { PartnershipType } from '@/lib/types';

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
    href: '/domain/apply',
  },
  {
    type: 'apps',
    title: 'App Partnership',
    description: 'Collaborate on application development, distribution, and monetization.',
    href: '/apps/apply',
  },
  {
    type: 'leaders',
    title: 'Leader Partnership',
    description: 'Guide initiatives, mentor partners, and shape our collective future.',
    href: '/leaders/apply',
  },
  {
    type: 'product-service',
    title: 'Product & Service',
    description: 'Bring your products and services to market through our partnership channels.',
    href: '/product-service/apply',
  },
];

export const PARTNERSHIP_LABELS: Record<PartnershipType, string> = {
  domain: 'Domain Partnership',
  apps: 'App Partnership',
  leaders: 'Leader Partnership',
  'product-service': 'Product/Service Partnership',
};
