import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartner } from "@/lib/auth";
import {
  getOpportunityByDomain,
  formatDomainDisplay,
  formatBrandStat,
  formatBrandValue,
} from "@/lib/portal-opportunities";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opportunity — iPartner",
  robots: { index: false },
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  await requirePartner();
  const { domain: raw } = await params;
  const domain = decodeURIComponent(raw || "").trim().toLowerCase();
  if (!domain || !domain.includes(".")) notFound();

  const opp = await getOpportunityByDomain(domain);
  if (!opp) notFound();

  return (
    <div className="relative mx-auto max-w-3xl space-y-6 pb-24 sm:space-y-8 sm:pb-0">
      <Link
        href="/portal/discover"
        className="inline-flex min-h-10 items-center text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
      >
        ← Back to Discover
      </Link>

      <header className="flex items-start gap-3 sm:gap-4">
        <BrandLogo domain={opp.domainName} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
            {opp.verticalName}
          </p>
          <h1 className="mt-1 break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {formatDomainDisplay(opp.domainName)}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Open partnership opportunity on this brand. Apply to build, sponsor, operate, or
            distribute — our team reviews every application.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">PartnerScore</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.partnerScore || "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{opp.partnerLabel}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Visitors / 30d</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.uniqueVisitors30d > 0 ? formatBrandStat(opp.uniqueVisitors30d) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Asset signal</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.value > 0 ? formatBrandValue(opp.value) : "—"}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Overview</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Category</dt>
            <dd className="mt-0.5 text-zinc-800">{opp.categoryName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Network partners</dt>
            <dd className="mt-0.5 tabular-nums text-zinc-800">{opp.partners || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Leads / offers</dt>
            <dd className="mt-0.5 tabular-nums text-zinc-800">
              {opp.leads} / {opp.offers}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">What we&apos;re looking for</dt>
            <dd className="mt-0.5 text-zinc-800">
              Builders, sponsors, operators, and distributors who can grow this name.
            </dd>
          </div>
        </dl>
      </section>

      {/* Desktop actions */}
      <div className="hidden flex-wrap gap-3 sm:flex">
        <Link
          href={`/apply?domain=${encodeURIComponent(opp.domainName)}`}
          className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Apply now
        </Link>
        <Link
          href={`/apply?mode=sponsor&domain=${encodeURIComponent(opp.domainName)}`}
          className="inline-flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Sponsor interest
        </Link>
        <a
          href={`mailto:hello@ipartner.com?subject=${encodeURIComponent(`Partnership: ${opp.domainName}`)}`}
          className="inline-flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Message partner
        </a>
      </div>

      {/* Mobile sticky CTA above bottom tabs */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-zinc-200/80 bg-white/95 p-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Link
            href={`/apply?domain=${encodeURIComponent(opp.domainName)}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white"
          >
            Apply now
          </Link>
          <a
            href={`mailto:hello@ipartner.com?subject=${encodeURIComponent(`Partnership: ${opp.domainName}`)}`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800"
          >
            Message
          </a>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-zinc-400">
        Messaging, contracts, and meeting scheduling ship in a later phase. Apply creates an
        engagement we review in admin.
      </p>
    </div>
  );
}
