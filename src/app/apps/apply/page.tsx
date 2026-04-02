import type { Metadata } from 'next';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = {
  title: 'Apply for App Partnership - iPartner',
  description: 'Apply to become an app partner with iPartner.',
};

interface PageProps {
  searchParams: Promise<{ invitecode?: string; cappcode?: string }>;
}

export default async function AppsApplyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const inviteCode = params.cappcode
    ? Buffer.from(params.cappcode, 'base64').toString('utf-8')
    : params.invitecode
    ? Buffer.from(params.invitecode, 'base64').toString('utf-8')
    : undefined;

  return (
    <div className="py-16 px-4 bg-[#0D1210] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">App Partnership Application</h1>
          <p className="text-[#5A6E62] mt-2">
            Complete the form below to apply for an app partnership.
          </p>
        </div>
        <ApplicationForm partnershipType="apps" inviteCode={inviteCode} />
      </div>
    </div>
  );
}
