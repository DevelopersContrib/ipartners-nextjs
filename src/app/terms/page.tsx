import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Use - iPartner', description: 'Terms of use for iPartner.com' };
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

export default function TermsPage() {
  return (
    <div className="bg-[#0D1210] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-10">Terms of Use</h1>
        <div className="prose prose-invert prose-lg max-w-none text-[#8B9E93] [&_h2]:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_a]:text-green-400 [&_a:hover]:text-green-300 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-2">
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using {DOMAIN}, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <h2>Disclaimer of Warranties</h2>
          <p>All content on {DOMAIN} is provided &quot;as-is&quot; without any warranty of any kind, either express or implied.</p>
          <h2>Limitation of Liability</h2>
          <p>In no event shall {DOMAIN} or its affiliates be liable for any direct, indirect, incidental, special, or consequential damages.</p>
          <h2>Content Submissions</h2>
          <p>By submitting content to {DOMAIN}, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content.</p>
          <h2>Prohibited Activities</h2>
          <ul><li>Using the service for any unlawful purpose</li><li>Automated scraping or use of robots</li><li>Attempting to gain unauthorized access</li><li>Using the site for commercial solicitation without permission</li></ul>
          <h2>Age Restriction</h2>
          <p>You must be at least 18 years old to use this service.</p>
          <h2>Governing Law</h2>
          <p>These terms shall be governed by the laws of the State of Delaware.</p>
          <h2>Contact</h2>
          <p>Questions about these terms should be sent through our <a href="/contact">contact page</a>.</p>
        </div>
      </div>
    </div>
  );
}
