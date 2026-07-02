'use client';

import { useState } from 'react';
import ApplicationForm from '@/components/ApplicationForm';
import PartnershipTypePicker from '@/components/PartnershipTypePicker';
import type { PartnershipType } from '@/lib/types';
import { PARTNERSHIP_LABELS } from '@/lib/partnerships';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function ApplyPageClient() {
  const [partnershipType, setPartnershipType] = useState<PartnershipType>('domain');

  return (
    <div className="py-16 px-4 bg-[#0D1210] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Apply for a Partnership</h1>
          <p className="text-[#5A6E62] mt-3 max-w-lg mx-auto">
            Choose the partnership type that fits you, then complete the application.
          </p>
        </div>

        <div id="apply-form">
          <PartnershipTypePicker value={partnershipType} onChange={setPartnershipType} />
          <p className="text-sm text-[#8B9E93] mb-6 text-center">
            Applying for: <span className="text-green-400 font-medium">{PARTNERSHIP_LABELS[partnershipType]}</span>
          </p>
          <ApplicationForm partnershipType={partnershipType} domain={DOMAIN} />
        </div>
      </div>
    </div>
  );
}
