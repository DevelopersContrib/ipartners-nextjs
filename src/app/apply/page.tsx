import type { Metadata } from 'next';
import ApplyPageClient from './ApplyPageClient';
import { getCurrentPartner } from '@/lib/auth';
import { getPartnerProfile } from '@/lib/partner-profile';
import type { PartnershipType } from '@/lib/types';
import { coerceMode } from '@/lib/engagements';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apply for a Partnership - iPartner',
  description: 'Choose your partnership type and apply to join iPartner.',
};

const IPARTNER_TYPES: PartnershipType[] = ['domain', 'apps', 'leaders', 'product-service'];

function coerceType(raw?: string): PartnershipType | undefined {
  if (!raw) return undefined;
  const t = raw.trim().toLowerCase();
  return (IPARTNER_TYPES as string[]).includes(t) ? (t as PartnershipType) : undefined;
}

/** Map engagement mode → legacy picker type for the form UI. */
function typeFromMode(mode?: string): PartnershipType | undefined {
  switch (mode) {
    case 'domain_owner':
      return 'domain';
    case 'app':
      return 'apps';
    case 'operator':
      return 'leaders';
    case 'vendor':
      return 'product-service';
    case 'sponsor':
    case 'builder':
    case 'referrer':
      return 'domain';
    default:
      return undefined;
  }
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; domain?: string; mode?: string; vertical?: string; tier?: string }>;
}) {
  const [partner, params] = await Promise.all([getCurrentPartner(), searchParams]);
  const profile = partner ? await getPartnerProfile(partner.email) : null;
  const mode = coerceMode(params.mode);

  return (
    <ApplyPageClient
      initialEmail={partner?.email ?? ''}
      initialType={coerceType(params.type) ?? typeFromMode(mode)}
      initialDomain={params.domain}
      initialProfile={profile ?? undefined}
      signedIn={!!partner}
      engagementMode={mode}
      vertical={params.vertical}
      tier={params.tier}
    />
  );
}
