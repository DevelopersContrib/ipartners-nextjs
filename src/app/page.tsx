import Link from 'next/link';
import ContribForm from '@/components/ContribForm';
import VenturePartners from '@/components/VenturePartners';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

const partnerships = [
  {
    title: 'Domain Partnerships',
    desc: 'Partner with premium domain assets and help build brand value through equity-based collaboration.',
    href: '/domain',
    iconBg: 'bg-green-500/10 text-green-400',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: 'App Partnerships',
    desc: 'Collaborate on application development, distribution, and monetization with our global network.',
    href: '/apps',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Leader Partnerships',
    desc: 'Join as a strategic leader to guide initiatives, mentor partners, and shape our collective future.',
    href: '/leaders',
    iconBg: 'bg-teal-500/10 text-teal-400',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Product & Service',
    desc: 'Bring your products and services to market through our established partnership channels.',
    href: '/product-service',
    iconBg: 'bg-lime-500/10 text-lime-400',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '500+', label: 'Active Partners' },
  { value: '1,000+', label: 'Premium Domains' },
  { value: '50+', label: 'Countries' },
  { value: '24/7', label: 'Global Support' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[#0A0F0D]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #15803D 0%, transparent 50%), radial-gradient(circle at 75% 75%, #059669 0%, transparent 50%)',
          }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322C55E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now accepting partnership applications
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white animate-fade-in-up">
              Build the Brands
              <br />
              <span className="gradient-text">of the Future</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[#8B9E93] max-w-xl mx-auto leading-relaxed animate-fade-in-up-delay-1">
              Join iPartner to create structured partnerships, leverage premium
              domain assets, and earn equity through your contributions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
              <Link
                href="/domain/apply"
                className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-500/30 pulse-glow"
              >
                Start Your Partnership
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center glass text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-[#5A6E62] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 sm:py-24 px-4 bg-[#0D1210]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Partnership Opportunities
            </h2>
            <p className="mt-4 text-lg text-[#5A6E62] max-w-2xl mx-auto">
              Choose the partnership model that aligns with your expertise and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {partnerships.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-7 hover:border-green-500/30 transition-all duration-300 card-hover glow-border"
              >
                <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-[#5A6E62] text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-5 flex items-center text-sm font-medium text-green-500/60 group-hover:text-green-400 transition-all duration-300">
                  Learn more
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 px-4 bg-[#0A0F0D]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-[#5A6E62] max-w-xl mx-auto">
              Getting started with iPartner is simple and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              { step: '01', title: 'Choose a Partnership', desc: 'Select the partnership type that matches your skills and interests.' },
              { step: '02', title: 'Submit Application', desc: 'Complete a quick application form with your background and goals.' },
              { step: '03', title: 'Start Contributing', desc: 'Begin building, earning equity, and growing with our community.' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center md:text-left">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-[#1E2D25]" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-2xl text-xl font-bold mb-5 shadow-lg shadow-green-600/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-[#5A6E62] text-sm leading-relaxed max-w-xs mx-auto md:mx-0">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venture Partners */}
      <div className="bg-[#0D1210]">
        <VenturePartners />
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#0A0F0D] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, #15803D 0%, transparent 50%)',
          }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Partner With Us?
          </h2>
          <p className="text-lg text-[#5A6E62] mb-10 max-w-xl mx-auto">
            Join hundreds of partners already building the next generation of brands.
          </p>
          <Link
            href="/domain/apply"
            className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-600/25"
          >
            Apply Now
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4 bg-[#0D1210]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Quick Application</h2>
            <p className="mt-4 text-[#5A6E62]">Or fill out the form below to get started immediately.</p>
          </div>
          <div className="bg-[#111916] rounded-2xl shadow-lg border border-[#1E2D25] p-6 sm:p-8">
            <ContribForm domain={DOMAIN} />
          </div>
        </div>
      </section>
    </>
  );
}
