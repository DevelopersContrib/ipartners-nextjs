import type { Metadata } from 'next';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = {
  title: 'Apply for Leader Partnership - iPartner',
  description: 'Apply to become a leader partner with iPartner.',
};

interface PageProps {
  searchParams: Promise<{ invitecode?: string }>;
}

export default async function LeadersApplyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const inviteCode = params.invitecode
    ? Buffer.from(params.invitecode, 'base64').toString('utf-8')
    : undefined;

  return (
    <div className="py-16 px-4 bg-[#0D1210] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Leader Partnership Application</h1>
          <p className="text-[#5A6E62] mt-2">
            Complete the form below to apply for a leader partnership.
          </p>
        </div>
        <ApplicationForm partnershipType="leaders" inviteCode={inviteCode} />
      </div>
    </div>
  );
}
