import type { Metadata } from 'next';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = {
  title: 'Apply for Leader Partnership - iPartner',
  description: 'Apply to become a leader partner with iPartner.',
};

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function LeadersApplyPage() {
  return (
    <div className="py-16 px-4 bg-[#0D1210] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Leader Partnership Application</h1>
          <p className="text-[#5A6E62] mt-3 max-w-lg mx-auto">
            Complete the form below to apply for a leader partnership with iPartner.
          </p>
          <p className="text-sm text-[#5A6E62] mt-2">
            Not sure which type fits?{' '}
            <a href="/apply" className="text-green-400 hover:text-green-300 underline-offset-2 hover:underline">
              Compare all partnership types
            </a>
          </p>
        </div>
        <div id="apply-form">
          <ApplicationForm partnershipType="leaders" domain={DOMAIN} />
        </div>
      </div>
    </div>
  );
}
