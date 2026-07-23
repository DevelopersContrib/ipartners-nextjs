import type { Metadata } from "next";
import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import PartnerSearch from "@/components/PartnerSearch";
import CategoryCards from "@/components/CategoryCards";

export const metadata: Metadata = {
  title: "Partnership Verticals — iPartner",
  description:
    "Explore AI, domains, payments, local services, and more. Search categories, see featured domains, and apply to sponsor or build.",
  openGraph: {
    title: "Partnership Verticals — iPartner",
    description: "Browse category verticals across 19,211 domains and find your partnership fit.",
    type: "website",
    url: "https://ipartner.com/verticals",
  },
};

export default function VerticalsIndexPage() {
  return (
    <>
      <section className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
            iPartner verticals
          </p>
          <h1 className="ipp-loud mt-4 max-w-3xl text-4xl sm:text-6xl text-[var(--ipp-text)]">
            Find the category your brand belongs in.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--ipp-secondary)]">
            Search by keyword or domain — every card opens a full vertical page with story and featured names.
          </p>
          <div className="mt-8 max-w-xl">
            <PartnerSearch autoFocus />
          </div>
          <p className="mt-4 text-sm text-[var(--ipp-secondary)]">
            Not sure?{" "}
            <Link href="/match" className="font-semibold text-[var(--ipp-accent)] hover:underline">
              Take the free partner match
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="ipp-loud text-3xl sm:text-4xl text-[var(--ipp-text)] mb-8">
          All categories.
        </h2>
        <CategoryCards verticals={VERTICALS} />
      </section>
    </>
  );
}
