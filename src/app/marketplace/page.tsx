import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link Marketplace — iPartner",
  description:
    "Browse 5,301 publisher sites across 12 verticals. Filter by niche, traffic, authority, and CPC. The full marketplace directory is launching soon.",
};

const stats = [
  { value: "5,301", label: "Publisher Sites" },
  { value: "12", label: "Verticals" },
  { value: "$1.50", label: "Avg. CPC" },
  { value: "8-Point", label: "Quality Filter" },
];

export default function MarketplacePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0A0F0D] py-24 sm:py-32 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 40%, #0d9488 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 border border-teal-500/20">
            Coming Soon
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            The Link{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#8B9E93] leading-relaxed max-w-xl mx-auto">
            Browse vetted publisher sites across 12 verticals. Filter by niche,
            traffic, authority, and CPC. Contextual link sponsorships with
            transparent pricing and real-time analytics.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0D1210] border-y border-[#1E2D25] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
                {s.value}
              </div>
              <div className="text-xs text-[#5A6E62] uppercase tracking-widest mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="py-20 px-4 bg-[#0A0F0D]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#8B9E93] leading-relaxed text-lg">
            The full marketplace directory is launching soon. Sponsors will be
            able to create campaigns, set CPC budgets, and get matched with
            quality publishers. Publishers can submit sites, pass the 8-point
            quality filter, and earn per-click revenue.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply?mode=sponsor"
              className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
            >
              Sponsor a Link →
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
