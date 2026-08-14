import type { Metadata } from 'next';
import Link from 'next/link';
import PricingTiers from '@/components/PricingTiers';

export const metadata: Metadata = { title: 'Domain Partnerships - iPartner', description: 'Partner with premium domain assets and help build brand value.' };

const features = [
  { title: 'Premium Domain Access', desc: 'Get access to high-value domain names to build your brand and establish a powerful online presence.' },
  { title: 'Equity-Based Model', desc: 'Earn real equity in domain assets through your productive contributions and partnership activities.' },
  { title: 'Global Community', desc: 'Join a worldwide network of partners collaborating across borders to build successful brands.' },
  { title: 'Revenue Sharing', desc: 'Benefit from monetization strategies across the portfolio with transparent revenue sharing.' },
  { title: 'Brand Building Tools', desc: 'Access professional tools, resources, and expertise to develop and grow your domain brand.' },
  { title: 'Dedicated Support', desc: 'Get personalized assistance from our partnership team to maximize your success.' },
];

export default function DomainPage() {
  return (
    <>
      <section className="relative hero-gradient py-20 sm:py-28 lg:py-32 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%2322C55E'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-300 text-sm font-medium mb-8">Most Popular Partnership</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">Domain Partnerships</h1>
          <p className="mt-6 text-lg sm:text-xl text-green-100/70 max-w-2xl mx-auto leading-relaxed">Partner with premium domain names and help monetize and build the brands of the future. Earn equity through your contributions.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply?mode=domain_owner" className="inline-flex items-center justify-center bg-green-500 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-400 transition-all shadow-lg shadow-green-500/25">
              Apply Now <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a href="#pricing" className="inline-flex items-center justify-center glass text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">How to join</a>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 px-4 bg-[#0D1210]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Domain Partnerships?</h2>
            <p className="mt-4 text-[#5A6E62] max-w-xl mx-auto">Everything you need to build a successful domain brand.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-7 hover:border-green-500/30 transition-all duration-300 card-hover glow-border">
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[#5A6E62] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-24 px-4 bg-[#0A0F0D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How to join</h2>
            <p className="mt-4 text-[#5A6E62] max-w-xl mx-auto">One apply path — domain owners, builders, and annual category sponsors.</p>
          </div>
          <PricingTiers />
        </div>
      </section>
    </>
  );
}
