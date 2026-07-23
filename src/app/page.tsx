import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import PartnerSearch from "@/components/PartnerSearch";
import CategoryCards from "@/components/CategoryCards";
import HowItWorks from "@/components/HowItWorks";
import FeaturedReview from "@/components/FeaturedReview";
import NetworkSection from "@/components/NetworkSection";
import SponsorshipPricing from "@/components/SponsorshipPricing";

const MODES = [
  {
    mode: "sponsor",
    title: "Sponsor",
    desc: "Category placement across a vertical — Bronze, Silver, or Gold.",
    href: "/apply?mode=sponsor",
  },
  {
    mode: "builder",
    title: "Builder",
    desc: "Equity-style partnership. Help grow a domain brand with us.",
    href: "/apply?mode=builder",
  },
  {
    mode: "domain_owner",
    title: "Domain owner",
    desc: "Bring a premium name into the network and activate it.",
    href: "/apply?mode=domain_owner",
  },
  {
    mode: "referrer",
    title: "Referrer",
    desc: "Send traffic and introductions. Earn when they convert.",
    href: "/apply?mode=referrer",
  },
  {
    mode: "vendor",
    title: "Vendor",
    desc: "Offer products or services across ventures that need you.",
    href: "/apply?mode=vendor",
  },
  {
    mode: "operator",
    title: "Operator",
    desc: "Lead day-to-day execution on a venture brand.",
    href: "/apply?mode=operator",
  },
];

export default function HomePage() {
  return (
    <div className="ipp-stack">
      {/* 1 — Hero */}
      <section className="ipp-band ipp-band-a">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)] animate-fade-in-up">
            Partnerships across 19,211 domains
          </p>
          <h1 className="ipp-loud mt-5 max-w-4xl text-[2.35rem] sm:text-6xl md:text-7xl text-[var(--ipp-text)] animate-fade-in-up-delay-1">
            Put your brand where the{" "}
            <span className="text-[var(--ipp-accent)]">category</span> already
            lives.
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-[var(--ipp-secondary)] leading-relaxed animate-fade-in-up-delay-1">
            We own the names people type. Sponsor a vertical and appear across every site in it —
            or take an equity stake and build one with us.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 animate-fade-in-up-delay-2">
            <Link
              href="/apply?mode=sponsor"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold hover:brightness-105 transition w-full sm:w-auto"
            >
              Sponsor a category
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl border-2 border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold hover:bg-white/70 transition w-full sm:w-auto"
            >
              Partner on a domain
            </Link>
            <Link
              href="/match"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl text-[var(--ipp-secondary)] font-semibold hover:text-[var(--ipp-text)] transition w-full sm:w-auto"
            >
              Free match →
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Search */}
      <section className="ipp-band ipp-band-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-md">
              <h2 className="ipp-loud text-3xl sm:text-4xl text-[var(--ipp-text)]">Search.</h2>
              <p className="mt-2 text-[var(--ipp-secondary)]">
                Find a vertical or domain — then open the category page.
              </p>
            </div>
            <div className="w-full lg:max-w-xl">
              <PartnerSearch />
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Categories */}
      <section className="ipp-band ipp-band-c">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="ipp-loud text-3xl sm:text-5xl text-[var(--ipp-text)]">Categories.</h2>
              <p className="mt-3 text-[var(--ipp-secondary)] max-w-lg">
                Best brands per vertical — tap a card for the story, featured domains, and how to partner.
              </p>
            </div>
            <Link
              href="/verticals"
              className="text-sm font-semibold text-[var(--ipp-accent)] hover:underline shrink-0"
            >
              All {VERTICALS.length} verticals →
            </Link>
          </div>
          <CategoryCards verticals={VERTICALS} />
        </div>
      </section>

      {/* 4 — Sponsorship */}
      <SponsorshipPricing />

      {/* 5 — Four steps */}
      <HowItWorks />

      {/* 6 — Review */}
      <FeaturedReview />

      {/* 7 — How to partner */}
      <section className="ipp-band ipp-band-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h2 className="ipp-loud text-3xl sm:text-5xl text-[var(--ipp-text)]">How to partner.</h2>
          <p className="mt-3 text-[var(--ipp-secondary)] max-w-xl">
            One identity. Many engagements. Pick the mode that fits — or take the free match.
          </p>
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODES.map((m) => (
              <li key={m.mode}>
                <Link
                  href={m.href}
                  className="block h-full rounded-2xl border border-[var(--border)] bg-white/90 p-5 hover:border-[var(--ipp-accent)] hover:bg-white transition"
                >
                  <p className="font-bold text-[var(--ipp-text)]">{m.title}</p>
                  <p className="mt-1.5 text-sm text-[var(--ipp-secondary)] leading-relaxed">{m.desc}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/match"
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border-2 border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold hover:bg-white/70 transition"
            >
              Free partner match
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — Network */}
      <NetworkSection />

      {/* 9 — Closing CTA */}
      <section className="ipp-band bg-[var(--ipp-primary)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h2 className="ipp-loud text-3xl sm:text-5xl max-w-2xl">
            Ready when you are.
          </h2>
          <p className="mt-4 text-white/75 max-w-md">
            Apply in minutes — or sign in to see every engagement in one dashboard.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold"
            >
              Apply now
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
