'use client';

const partners = [
  {
    name: 'VNOC',
    url: 'https://vnoc.com',
    logo: 'https://vnoc.com/images/logo/logo-vnoc-with-ecorp-forwhite.svg',
    description: 'The leading blockchain venture platform for building, managing, and monetizing digital assets through integrated tools and tokenization.',
  },
  {
    name: 'Contrib',
    url: 'https://contrib.com',
    logo: 'https://cdn.vnoc.com/logos/logo-Contrib-white-1.png',
    description: 'A decentralized microtask platform where global contributors complete work for blockchain-based compensation across development, marketing, and design.',
  },
  {
    name: 'VentureOS',
    url: 'https://ventureos.com',
    logo: 'https://www.ventureos.com/logo-ventureos.png',
    description: 'The operating system for URLs. Turn premium domains into autonomous smart ventures with AI agents, playbooks, and tokenized incentives.',
  },
  {
    name: 'Referrals.com',
    url: 'https://referrals.com',
    logo: 'https://d1p6j71028fbjm.cloudfront.net/logos/logo-new-referral-1.png',
    description: 'A referral program platform enabling businesses to create and manage viral referral campaigns with social rewards and analytics.',
  },
  {
    name: 'PayDirect',
    url: 'https://paydirect.com',
    logo: 'https://paydirect.com/logo-paydirect.png',
    description: 'Instant crypto settlement for AI agents and developers through programmable blockchain transactions and agent-native wallets.',
  },
  {
    name: 'AgentBank',
    url: 'https://agentbank.com',
    logo: 'https://agentbank.com/logo-agentbank.png',
    description: 'The programmable treasury engine for the autonomous agent economy. Budget allocation, multi-agent settlement, and cap table automation.',
  },
  {
    name: 'AgentDAO',
    url: 'https://agentdao.com',
    logo: 'https://vnoclogos.s3-us-west-1.amazonaws.com/logo-agentdao_teal.png',
    description: 'Transforming URLs into AI-powered autonomous digital entities capable of generating revenue and executing tasks autonomously.',
  },
  {
    name: 'Handyman.com',
    url: 'https://handyman.com',
    logo: 'https://cdn.vnoc.com/logos/logo-handyman.png',
    description: 'A marketplace connecting homeowners with trusted licensed contractors for all home improvement projects and repairs.',
  },
  {
    name: 'DomainDirectory',
    url: 'https://domaindirectory.com',
    logo: 'https://domaindirectory.com/logo.png',
    description: 'A premium domain marketplace for buying, selling, trading, and developing domain assets with 20+ years of experience.',
  },
];

export default function VenturePartners() {
  return (
    <section className="py-20 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
            Our Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Venture Partners
          </h2>
          <p className="mt-4 text-lg text-[#5A6E62] max-w-2xl mx-auto">
            We collaborate with an ecosystem of innovative platforms powering the future of digital ventures, AI agents, and decentralized work.
          </p>
        </div>

        {/* Partner grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-7 hover:border-green-500/30 transition-all duration-300 card-hover glow-border"
            >
              {/* Logo */}
              <div className="h-10 mb-5 flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 max-w-[160px] w-auto object-contain brightness-90 group-hover:brightness-110 transition-all"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span
                  className="hidden text-xl font-bold text-white items-center"
                  style={{ display: 'none' }}
                >
                  {partner.name}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                {partner.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#5A6E62] leading-relaxed group-hover:text-[#8B9E93] transition-colors">
                {partner.description}
              </p>

              {/* Visit link */}
              <div className="mt-4 flex items-center text-sm font-medium text-green-500/60 group-hover:text-green-400 transition-colors">
                Visit site
                <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
