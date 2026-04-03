import Link from 'next/link';

const tiers = [
  {
    name: 'Free', price: '$0', period: 'forever',
    features: ['Basic partnership access', 'Community membership', 'Standard support', 'Public profile listing'],
    cta: 'Get Started Free', href: '/domain/apply#apply-form', popular: false,
  },
  {
    name: 'Standard', price: '$49', period: '/month',
    features: ['Everything in Free', 'Priority partnership matching', 'Advanced analytics dashboard', 'Premium email support', 'Custom branding options'],
    cta: 'Start Standard', href: '/domain/apply?plan=standard#apply-form', popular: true,
  },
  {
    name: 'Premium', price: '$149', period: '/month',
    features: ['Everything in Standard', 'Dedicated account manager', 'API access', 'White-label solutions', 'Revenue sharing program', 'Priority listing'],
    cta: 'Go Premium', href: '/domain/apply?plan=premium#apply-form', popular: false,
  },
];

export default function PricingTiers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative rounded-2xl bg-[#111916] border-2 p-6 sm:p-8 flex flex-col transition-all duration-300 ${
            tier.popular
              ? 'border-green-500/40 md:-mt-4 md:mb-[-16px] shadow-xl shadow-green-500/10'
              : 'border-[#1E2D25] hover:border-[#2A3D32]'
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-green-600/30">Most Popular</span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl sm:text-5xl font-extrabold text-white">{tier.price}</span>
            <span className="text-[#5A6E62] ml-1 text-sm">{tier.period}</span>
          </div>
          <ul className="space-y-3.5 mb-8 flex-1">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#8B9E93] text-sm leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href={tier.href}
            className={`block text-center py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 ${
              tier.popular
                ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/20'
                : 'bg-[#1A2420] text-white hover:bg-[#223029] border border-[#2A3D32]'
            }`}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
