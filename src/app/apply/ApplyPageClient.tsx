'use client';

import { useState } from 'react';
import ApplicationForm from '@/components/ApplicationForm';
import PartnershipTypePicker from '@/components/PartnershipTypePicker';
import type { PartnershipType } from '@/lib/types';
import { PARTNERSHIP_LABELS } from '@/lib/partnerships';
import { MODE_LABELS, type EngagementMode } from '@/lib/engagement-modes';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function ApplyPageClient({
  initialEmail = '',
  initialType,
  initialDomain,
  initialProfile,
  signedIn = false,
  engagementMode,
  vertical,
  tier,
}: {
  initialEmail?: string;
  initialType?: PartnershipType;
  initialDomain?: string;
  initialProfile?: { firstname?: string; lastname?: string; country?: string; industry?: string };
  signedIn?: boolean;
  engagementMode?: EngagementMode;
  vertical?: string;
  tier?: string;
}) {
  const [partnershipType, setPartnershipType] = useState<PartnershipType>(initialType ?? 'domain');
  const isSponsor = engagementMode === 'sponsor';

  return (
    <div className="py-16 px-4 bg-[var(--ipp-bg)] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ipp-text)]">
            {isSponsor ? 'Sponsor a category' : 'Apply for a Partnership'}
          </h1>
          <p className="text-[var(--ipp-secondary)] mt-3 max-w-lg mx-auto">
            {isSponsor
              ? 'Tell us which vertical you want — we record your interest and follow up. No checkout yet.'
              : 'Choose how you want to partner, then complete the application.'}
          </p>
          {engagementMode && (
            <p className="text-sm text-[var(--ipp-secondary)] mt-3">
              Mode:{' '}
              <span className="text-[var(--ipp-accent)] font-medium">
                {MODE_LABELS[engagementMode]}
              </span>
              {vertical ? ` · ${vertical}` : ''}
              {tier ? ` · ${tier}` : ''}
            </p>
          )}
          {signedIn && initialEmail && (
            <p className="text-sm text-[var(--ipp-secondary)] mt-4">
              Signed in as <span className="text-[var(--ipp-text)] font-medium">{initialEmail}</span>
            </p>
          )}
        </div>

        <div id="apply-form">
          {!isSponsor && (
            <>
              <PartnershipTypePicker value={partnershipType} onChange={setPartnershipType} />
              <p className="text-sm text-[var(--ipp-secondary)] mb-6 text-center">
                Applying for:{' '}
                <span className="text-[var(--ipp-accent)] font-medium">
                  {PARTNERSHIP_LABELS[partnershipType]}
                </span>
              </p>
            </>
          )}
          <ApplicationForm
            partnershipType={partnershipType}
            domain={initialDomain || DOMAIN}
            initialEmail={initialEmail}
            initialProfile={initialProfile}
            engagementMode={engagementMode}
            vertical={vertical}
            tier={tier}
          />
        </div>
      </div>
    </div>
  );
}
