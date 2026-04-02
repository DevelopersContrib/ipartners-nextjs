import { getDomainInfo, getDomainAttributes, getSignupFormData, getDomainAffiliateId } from './api';
import type { SiteConfig, DomainInfo } from './types';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

let cachedConfig: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cachedConfig) return cachedConfig;

  const [domainInfo, formData] = await Promise.all([
    getDomainInfo(DOMAIN),
    getSignupFormData(),
  ]);

  let enrichedInfo: DomainInfo | null = null;

  if (domainInfo) {
    const [attributes, affiliateId] = await Promise.all([
      getDomainAttributes(DOMAIN),
      getDomainAffiliateId(DOMAIN),
    ]);

    enrichedInfo = {
      ...domainInfo,
      ...(attributes ?? {}),
      domain_affiliate_link: affiliateId
        ? `https://www.contrib.com/signup/ipartner?ref=${affiliateId}`
        : '',
    };
  }

  cachedConfig = {
    domain: DOMAIN,
    domainInfo: enrichedInfo,
    formData,
  };

  return cachedConfig;
}

export function getDefaultConfig(): SiteConfig {
  return {
    domain: DOMAIN,
    domainInfo: {
      domainid: '',
      domainname: DOMAIN,
      memberid: '',
      title: 'iPartner',
      logo: '',
      description: 'Be an IPartner Today',
      account_ga: process.env.NEXT_PUBLIC_GA_ID || '',
      background_image: '',
      introduction: '',
      about: '',
      forsale: '0',
      forsaletext: '',
      follow_count: 0,
      domain_affiliate_link: '',
    },
    formData: null,
  };
}
