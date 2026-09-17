import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sponsor Dashboard — iPartner",
  description:
    "Create campaigns, set CPC budgets, choose verticals, and track real-time click analytics. The sponsor self-serve dashboard is coming soon.",
};

const features = [
  {
    icon: "🎯",
    title: "Choose Your Vertical",
    desc: "Target specific niches across 12 verticals for maximum relevance.",
  },
  {
    icon: "💰",
    title: "Set CPC Budgets",
    desc: "Control spend with per-click pricing and daily caps.",
  },
  {
    icon: "📊",
    title: "Real-Time Analytics",
    desc: "Track clicks, conversions, and ROI with live dashboards.",
  },
  {
    icon: "🛡️",
    title: "8-Point Quality Filter",
    desc: "Every publisher site is vetted for traffic, relevance, and authority.",
  },
];

export default function SponsorPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0A0F0D] py-24 sm:py-32 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 40% 50%, #0d9488 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 border border-teal-500/20">
            Coming Soon
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Sponsor{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#8B9E93] leading-relaxed max-w-xl mx-auto">
            Create campaigns, set CPC budgets, choose verticals, and track
            real-time click analytics. The self-serve sponsor dashboard is
            coming soon.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#0D1210]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-7"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white text-lg">{f.title}</h3>
                <p className="text-[#5A6E62] text-sm mt-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0A0F0D]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#8B9E93] leading-relaxed text-lg mb-10">
            Want to get started before the dashboard launches? Contact us to set
            up your first campaign today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply?mode=sponsor"
              className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
            >
              Start a Campaign →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-[#1E2D25] text-[#8B9E93] px-8 py-4 rounded-xl text-lg font-semibold hover:border-teal-500/30 hover:text-white transition-all"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
