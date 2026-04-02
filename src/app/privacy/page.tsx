import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy - iPartner', description: 'Privacy policy for iPartner.com' };
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function PrivacyPage() {
  return (
    <div className="bg-[#0D1210] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#5A6E62] mb-10">Effective Date: January 18, 2012</p>
        <div className="prose prose-invert prose-lg max-w-none text-[#8B9E93] [&_h2]:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_a]:text-green-400 [&_a:hover]:text-green-300 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-2">
          <p>This privacy statement describes how {DOMAIN} collects and uses the personal information you provide on our website. It also describes the choices available to you regarding our use of your personal information and how you can access and update this information.</p>
          <h2>Collection of Personal Information</h2>
          <p>We collect the following personal information from you: contact information such as name, email address, mailing address, and phone number. We also collect demographic information such as age, education, gender, interests, and zip code.</p>
          <h2>Use of Information</h2>
          <ul><li>Fulfill your order or service request</li><li>Send you requested product or service information</li><li>Respond to customer service requests</li><li>Administer your account</li><li>Send you marketing communications</li><li>Conduct research and analysis</li></ul>
          <h2>Security</h2>
          <p>The security of your personal information is important to us. We follow generally accepted industry standards to protect the personal information submitted to us.</p>
          <h2>Your Rights (GDPR)</h2>
          <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that it be corrected, updated, or deleted.</p>
          <h2>Contact Us</h2>
          <p>If you have questions regarding this policy, contact us through our <a href="/contact">contact page</a>.</p>
        </div>
      </div>
    </div>
  );
}
