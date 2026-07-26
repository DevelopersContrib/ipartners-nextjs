import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODE_LABELS, statusLabel, type EngagementMode } from "@/lib/engagement-modes";
import {
  getDiscoverOpportunities,
  formatDomainDisplay,
  formatBrandStat,
} from "@/lib/portal-opportunities";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home — iPartner",
  robots: { index: false },
};

export default async function PortalHomePage() {
  const partner = await requirePartner("/portal");
  const name =
    [partner.firstName, partner.lastName].filter(Boolean).join(" ") ||
    partner.email.split("@")[0] ||
    "there";

  const engagements = await prisma.ippEngagement.findMany({
    where: { email: partner.email },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const pending = engagements.filter((e) => e.status === "pending");
  const active = engagements.filter(
    (e) => e.status === "approved" || e.status === "active",
  );

  const engagedDomains = new Set(
    engagements
      .map((e) => e.scopeValue?.toLowerCase())
      .filter((v): v is string => !!v && v.includes(".")),
  );

  const matches = (await getDiscoverOpportunities({ limit: 12 })).filter(
    (o) => !engagedDomains.has(o.domainName.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-7 sm:space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
          Welcome back
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Hi {name}. New opportunities are waiting.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          Browse partnership matches across the network — then apply, follow up, and grow.
        </p>
        <div className="pt-1 sm:pt-2">
          <Link
            href="/portal/discover"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99] sm:w-auto"
          >
            Find opportunities
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">New partnership matches</h2>
          <Link
            href="/portal/discover"
            className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            See all
          </Link>
        </div>
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 sm:p-6">
            No fresh matches yet — explore Discover to browse the full inventory.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matches.slice(0, 6).map((m) => (
              <li key={m.domainName}>
                <Link
                  href={`/portal/opportunities/${encodeURIComponent(m.domainName)}`}
                  className="flex min-h-[4.5rem] gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3.5 transition hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:bg-zinc-50 sm:p-4"
                >
                  <BrandLogo domain={m.domainName} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {formatDomainDisplay(m.domainName)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {m.verticalName}
                      {m.partnerScore > 0 ? ` · Score ${m.partnerScore}` : ""}
                    </p>
                    {m.uniqueVisitors30d > 0 && (
                      <p className="mt-1 text-xs tabular-nums text-zinc-400">
                        {formatBrandStat(m.uniqueVisitors30d)} visitors / 30d
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">Applications in flight</h2>
          <ul className="space-y-2">
            {pending.slice(0, 5).map((e) => (
              <li
                key={String(e.id)}
                className="flex flex-col gap-1 rounded-2xl border border-amber-200/80 bg-amber-50/50 px-3.5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4"
              >
                <span className="text-sm font-medium text-zinc-900">
                  {MODE_LABELS[e.mode as EngagementMode] || e.mode}
                </span>
                {e.scopeValue && (
                  <span className="truncate font-mono text-xs text-zinc-500">{e.scopeValue}</span>
                )}
                <span className="text-xs text-amber-800 sm:ml-auto">
                  {statusLabel(e.status)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/portal/deals"
            className="inline-block text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            View all deals →
          </Link>
        </section>
      )}

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">Active partnerships</h2>
          <ul className="space-y-2">
            {active.slice(0, 5).map((e) => (
              <li
                key={String(e.id)}
                className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4"
              >
                <span className="text-sm font-medium text-zinc-900">
                  {MODE_LABELS[e.mode as EngagementMode] || e.mode}
                </span>
                {e.scopeValue && (
                  <span className="truncate font-mono text-xs text-zinc-500">{e.scopeValue}</span>
                )}
                <span className="text-xs text-zinc-500 sm:ml-auto">
                  {statusLabel(e.status)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-4 sm:p-5">
          <p className="text-sm font-medium text-zinc-800">Invitations</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            When partners invite you to a deal, they&apos;ll show up here.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-4 sm:p-5">
          <p className="text-sm font-medium text-zinc-800">Contracts awaiting signature</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Coming soon — agreements will land here when they&apos;re ready.
          </p>
        </div>
      </section>
    </div>
  );
}
