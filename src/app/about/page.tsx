import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - iPartner',
  description: 'Learn about iPartner and our mission to create structured partnerships.',
};

const values = [
  { title: 'Structure', desc: 'Clear roles, expectations, and processes for every partnership.', icon: '📐' },
  { title: 'Transparency', desc: 'Open communication and clear equity models for all partners.', icon: '🔍' },
  { title: 'Equity', desc: 'Real equity earned through productive contributions and effort.', icon: '💎' },
  { title: 'Community', desc: 'A global network collaborating to build successful brands.', icon: '🌍' },
];

const offerings = [
  { title: 'Domain Partnerships', desc: 'Partner with premium domain names to build brand value and generate revenue.', href: '/domain' },
  { title: 'App Partnerships', desc: 'Collaborate on application development, distribution, and monetization.', href: '/apps' },
  { title: 'Leadership Opportunities', desc: 'Join as a leader to guide strategic initiatives and shape the future.', href: '/leaders' },
  { title: 'Product & Service', desc: 'Bring your products and services to market through our network.', href: '/product-service' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0A0F0D] py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #15803D 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            About <span className="gradient-text">iPartner</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#8B9E93] leading-relaxed max-w-xl mx-auto">
            Creating a more structured way of building, filtering, and growing partnerships for the digital age.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-[#0D1210]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium mb-6">Our Mission</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Structured partnerships for meaningful growth</h2>
              <p className="mt-6 text-[#8B9E93] leading-relaxed">
                iPartner was formed to create a more structured way of creating, filtering and growing relationships. Members earn iPartner status and participate in equity-for-productivity opportunities.
              </p>
              <p className="mt-4 text-[#8B9E93] leading-relaxed">
                We believe that the best partnerships are built on transparency, shared goals, and clear value exchange. Our platform connects individuals and organizations to collaborate through premium domain assets.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-5">
                  <div className="text-2xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-white text-sm">{v.title}</h3>
                  <p className="text-xs text-[#5A6E62] mt-1 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-20 px-4 bg-[#0A0F0D]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">What We Offer</h2>
            <p className="mt-4 text-[#5A6E62] max-w-xl mx-auto">Multiple partnership paths designed for different skills and goals.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {offerings.map((o) => (
              <Link key={o.title} href={o.href} className="rounded-2xl border border-[#1E2D25] bg-[#111916] p-6 sm:p-7 hover:border-green-500/30 transition-all duration-300 group glow-border">
                <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">{o.title}</h3>
                <p className="text-[#5A6E62] text-sm mt-2 leading-relaxed">{o.desc}</p>
                <span className="inline-flex items-center text-sm font-medium mt-4 text-green-500/60 group-hover:text-green-400">
                  Explore <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0D1210]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Join?</h2>
          <p className="text-lg text-[#5A6E62] mb-10 max-w-xl mx-auto">Whether you&apos;re an experienced professional or just starting out, iPartner has a partnership opportunity for you.</p>
          <Link href="/domain/apply" className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-600/20">
            Apply Now <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </>
  );
}
