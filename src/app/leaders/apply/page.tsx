import type { Metadata } from 'next';
import ContribForm from '@/components/ContribForm';

export const metadata: Metadata = {
  title: 'Apply for Leader Partnership - iPartner',
  description: 'Apply to become a leader partner with iPartner.',
};

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function LeadersApplyPage() {
  return (
    <div className="py-16 px-4 bg-[#0D1210] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Leader Partnership Application</h1>
          <p className="text-[#5A6E62] mt-3 max-w-lg mx-auto">
            Complete the form below to apply for a leader partnership with iPartner.
          </p>
        </div>
        <div id="apply-form" className="bg-[#111916] rounded-2xl border border-[#1E2D25] p-6 sm:p-8">
          <ContribForm domain={DOMAIN} />
        </div>
      </div>
    </div>
  );
}
