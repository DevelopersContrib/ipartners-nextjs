import Link from "next/link";
import { sponsorCheckoutHref } from "@/lib/sponsor-pricing";

/**
 * Legacy /domain lander “pricing” — no longer sells conflicting $49/$149 monthly
 * memberships. Points into the unified engagement modes + annual sponsor checkout.
 */
const paths = [
  {
    name: "Domain owner",
    price: "Apply",
    period: "free",
    features: [
      "Bring a premium name into the network",
      "Activate with builders and operators",
      "Equity-style collaboration on the brand",
    ],
    cta: "Apply as domain owner",
    href: "/apply?mode=domain_owner",
    popular: false,
  },
  {
    name: "Builder",
    price: "Apply",
    period: "equity",
    features: [
      "Help grow a domain brand with us",
      "Clear roles and review process",
      "Track status in the partner portal",
    ],
    cta: "Apply as builder",
    href: "/apply?mode=builder",
    popular: true,
  },
  {
    name: "Sponsor",
    price: "From $500",
    period: "/ year",
    features: [
      "Bronze, Silver, or Gold category placement",
      "Pay annually via PayDirect (card or crypto)",
      "Approved when payment settles",
    ],
    cta: "Sponsor a category",
    href: sponsorCheckoutHref({ tier: "bronze" }),
    popular: false,
  },
];

export default function PricingTiers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
      {paths.map((tier) => (
        <div
          key={tier.name}
          className={`relative rounded-2xl bg-[#111916] border-2 p-6 sm:p-8 flex flex-col transition-all duration-300 ${
            tier.popular
              ? "border-green-500/40 md:-mt-4 md:mb-[-16px] shadow-xl shadow-green-500/10"
              : "border-[#1E2D25] hover:border-[#2A3D32]"
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-green-600/30">
                Popular
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
          <div className="mt-4 mb-6">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {tier.price}
            </span>
            <span className="text-[#5A6E62] ml-1 text-sm">{tier.period}</span>
          </div>
          <ul className="space-y-3.5 mb-8 flex-1">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-[#8B9E93] text-sm leading-snug">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={tier.href}
            className={`block text-center py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 ${
              tier.popular
                ? "bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/20"
                : "bg-[#1A2420] text-white hover:bg-[#223029] border border-[#2A3D32]"
            }`}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
