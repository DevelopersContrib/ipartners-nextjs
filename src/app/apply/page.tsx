import type { Metadata } from 'next';
import ApplyPageClient from './ApplyPageClient';
import { getCurrentPartner } from '@/lib/auth';
import type { PartnershipType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apply for a Partnership - iPartner',
  description: 'Choose your partnership type and apply to join iPartner.',
};

const IPARTNER_TYPES: PartnershipType[] = ['domain', 'apps', 'leaders', 'product-service'];

/**
 * NOTE: two partnership taxonomies exist and they are NOT the same set.
 *   iPartner picker : domain | apps | leaders | product-service
 *   DomainDirectory : Sponsorship | Distribution | Affiliate | Added-Value
 * A DD hand-off may carry either, so only preselect when it matches one of ours;
 * otherwise fall back to the default and let the partner choose.
 */
function coerceType(raw?: string): PartnershipType | undefined {
  if (!raw) return undefined;
  const t = raw.trim().toLowerCase();
  return (IPARTNER_TYPES as string[]).includes(t) ? (t as PartnershipType) : undefined;
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; domain?: string }>;
}) {
  const [partner, params] = await Promise.all([getCurrentPartner(), searchParams]);

  return (
    <ApplyPageClient
      initialEmail={partner?.email ?? ''}
      initialType={coerceType(params.type)}
      initialDomain={params.domain}
      signedIn={!!partner}
    />
  );
}
