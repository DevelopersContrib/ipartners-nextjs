import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Publisher Portal — iPartner",
  description:
    "Submit your site, pass the 8-point quality filter, and start earning per-click revenue from contextual sponsor links. Publisher onboarding opens soon.",
};

const steps = [
  {
    num: "1",
    title: "Submit Your Site",
    desc: "Add your domain and basic site info for review.",
  },
  {
    num: "2",
    title: "Pass the 8-Point Filter",
    desc: "We check traffic, relevance, authority, content quality, and more.",
  },
  {
    num: "3",
    title: "Get Matched",
    desc: "Our engine pairs you with relevant sponsors automatically.",
  },
  {
    num: "4",
    title: "Earn Per-Click",
    desc: "Contextual links appear in your content. You earn on every click.",
  },
];

export default function PublisherPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0A0F0D] py-24 sm:py-32 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 60% 50%, #0d9488 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 border border-teal-500/20">
            Coming Soon
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Publisher{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Portal
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#8B9E93] leading-relaxed max-w-xl mx-auto">
            Submit your site, pass the 8-point quality filter, and start earning
            per-click revenue from contextual sponsor links. Publisher
            onboarding opens soon.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4 bg-[#0D1210]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-5">
            {steps.map((s) => (
              <div
                key={s.num}
                className="flex gap-5 items-start bg-[#111916] border border-[#1E2D25] rounded-2xl p-6"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-teal-500/15 text-teal-400 rounded-full flex items-center justify-center font-bold text-sm">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{s.title}</h3>
                  <p className="text-[#5A6E62] text-sm mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0A0F0D]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#8B9E93] leading-relaxed text-lg mb-10">
            Publisher onboarding opens soon. List your site now to join the
            waitlist and be first in line when we launch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply?mode=publisher"
              className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
            >
              List Your Site →
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
