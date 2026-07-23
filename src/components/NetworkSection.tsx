"use client";

const NETWORK = [
  {
    name: "Contrib",
    url: "https://contrib.com",
    logo: "https://cdn.vnoc.com/logos/logo-new-contrib-6.png",
    blurb: "Microtasks, contributors, and venture collaboration across the portfolio.",
  },
  {
    name: "VNOC",
    url: "https://vnoc.com",
    logo: "https://vnoc.com/images/logo/logo-vnoc-with-ecorp-forwhite.svg",
    blurb: "Venture operating system for building and monetizing digital assets.",
  },
  {
    name: "AgentDAO",
    url: "https://agentdao.com",
    logo: "https://vnoclogos.s3-us-west-1.amazonaws.com/logo-agentdao_teal.png",
    blurb: "AI-native entities and agent infrastructure on premium URLs.",
  },
  {
    name: "Referrals.com",
    url: "https://referrals.com",
    logo: "https://d1p6j71028fbjm.cloudfront.net/logos/logo-new-referral-1.png",
    blurb: "Distribution rails — send traffic, measure it, earn when it converts.",
  },
  {
    name: "DomainDirectory",
    url: "https://domaindirectory.com",
    logo: "https://domaindirectory.com/logo.png",
    blurb: "Premium domain marketplace and inventory across the network.",
  },
  {
    name: "PayDirect",
    url: "https://paydirect.com",
    logo: "https://paydirect.com/logo-paydirect.png",
    blurb: "Settlement and payouts for modern partner economies.",
  },
  {
    name: "VentureOS",
    url: "https://ventureos.com",
    logo: "https://www.ventureos.com/logo-ventureos.png",
    blurb: "Turn URLs into autonomous ventures with playbooks and agents.",
  },
  {
    name: "Handyman.com",
    url: "https://handyman.com",
    logo: "https://cdn.vnoc.com/logos/logo-handyman.png",
    blurb: "Flagship local-services brand — high-intent category gravity.",
  },
];

export default function NetworkSection() {
  return (
    <section className="ipp-band ipp-band-a">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          Ecosystem
        </p>
        <h2 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)]">
          The network.
        </h2>
        <p className="mt-3 max-w-xl text-[var(--ipp-secondary)]">
          Partners don&apos;t sit on an island — they sit beside brands already moving traffic across
          19,211 domains.
        </p>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {NETWORK.map((p, i) => (
            <li key={p.name} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 7) * 0.04}s` }}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white/90 p-5 transition duration-200 hover:border-[var(--ipp-accent)] hover:bg-white hover:shadow-sm"
              >
                <div className="h-10 flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt=""
                    className="h-7 max-w-[140px] w-auto object-contain object-left opacity-70 transition group-hover:opacity-100 [filter:brightness(0)_saturate(100%)]"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const fallback = el.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "block";
                    }}
                  />
                  <span className="hidden text-base font-bold text-[var(--ipp-text)]">{p.name}</span>
                </div>
                <h3 className="mt-4 font-bold text-[var(--ipp-text)] group-hover:text-[var(--ipp-primary)]">
                  {p.name}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--ipp-secondary)] leading-relaxed flex-1">
                  {p.blurb}
                </p>
                <span className="mt-4 text-sm font-semibold text-[var(--ipp-accent)] inline-flex items-center gap-1">
                  Visit
                  <svg
                    className="w-4 h-4 transition group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
