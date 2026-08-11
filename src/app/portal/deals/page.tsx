import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODE_LABELS, statusLabel, type EngagementMode } from "@/lib/engagement-modes";
import { ENGAGEMENT_STATUSES } from "@/lib/admin-client";
import DomainReferralLink from "@/components/DomainReferralLink";
import PendingPartnerAgent from "@/components/portal/PendingPartnerAgent";
import { formatDomainDisplay } from "@/lib/vertical-brands";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deals — iPartner",
  robots: { index: false },
};

const COLUMNS = ["pending", "approved", "active", "declined", "lapsed"] as const;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string }>;
}) {
  const partner = await requirePartner("/portal/deals");
  const { applied } = await searchParams;
  const engagements = await prisma.ippEngagement.findMany({
    where: { email: partner.email },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const byStatus = Object.fromEntries(
    COLUMNS.map((s) => [s, engagements.filter((e) => e.status === s)]),
  ) as Record<(typeof COLUMNS)[number], typeof engagements>;

  const approved = byStatus.approved;
  const pendingChat = byStatus.pending.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Deals
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your engagements by status — a thin pipeline, not a CRM.
          </p>
        </div>
        <Link
          href="/apply"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 sm:h-10 sm:w-auto"
        >
          New application
        </Link>
      </header>

      {applied && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
          Application received. It shows under <strong>pending</strong> while we review —
          chat with the partner agent below to speed qualification.
        </div>
      )}

      {pendingChat.length > 0 && (
        <div className="space-y-4">
          {pendingChat.map((e) => (
            <PendingPartnerAgent
              key={String(e.id)}
              engagementId={String(e.id)}
              scopeLabel={
                e.scopeValue ||
                MODE_LABELS[e.mode as EngagementMode] ||
                e.mode
              }
            />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Approved — activation checklist
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">
            Approved means iPartner accepted you. <strong>Active</strong> means you are live on
            the network after publish (managed separately). Until then:
          </p>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-zinc-700">
            <li>Confirm each approved deal below looks correct (mode + domain/vertical)</li>
            <li>Watch for kickoff mail from our team</li>
            <li>
              Reply to{" "}
              <a
                href="mailto:hello@ipartner.com"
                className="underline underline-offset-2"
              >
                hello@ipartner.com
              </a>{" "}
              if anything is wrong before go-live
            </li>
          </ol>
          <ul className="space-y-2 pt-1">
            {approved.map((e) => (
              <li
                key={String(e.id)}
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-sm"
              >
                <span className="font-medium">
                  {MODE_LABELS[e.mode as EngagementMode] || e.mode}
                </span>
                {e.scopeValue && (
                  <span className="ml-2 font-mono text-xs text-zinc-500">
                    {e.scopeValue}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {engagements.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center sm:p-8">
          <p className="text-sm text-zinc-600">No deals yet.</p>
          <Link
            href="/portal/discover"
            className="text-sm font-semibold text-zinc-900 underline underline-offset-2"
          >
            Discover opportunities
          </Link>
        </div>
      ) : (
        <>
          <div className="-mx-3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-3 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-3">
              {COLUMNS.map((status) => (
                <section
                  key={status}
                  className="w-[min(16.5rem,78vw)] shrink-0 snap-start rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 capitalize">
                    {status} · {byStatus[status].length}
                  </h2>
                  <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
                    {byStatus[status].map((e) => (
                      <DealCard key={String(e.id)} e={e} />
                    ))}
                    {byStatus[status].length === 0 && (
                      <li className="py-4 text-center text-xs text-zinc-400">None</li>
                    )}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
            {COLUMNS.map((status) => (
              <section
                key={status}
                className="min-h-[12rem] rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 capitalize">
                  {status} · {byStatus[status].length}
                </h2>
                <ul className="space-y-2">
                  {byStatus[status].map((e) => (
                    <DealCard key={String(e.id)} e={e} />
                  ))}
                  {byStatus[status].length === 0 && (
                    <li className="py-4 text-center text-xs text-zinc-400">None</li>
                  )}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <p className="text-xs leading-relaxed text-zinc-400">
        Status meanings: pending = under review · approved = accepted (awaiting publish) ·
        active = live · {ENGAGEMENT_STATUSES.filter((s) => s === "declined" || s === "lapsed").join(" · ")}.
      </p>
    </div>
  );
}

function DealCard({
  e,
}: {
  e: {
    id: bigint | number;
    mode: string;
    status: string;
    scopeValue: string | null;
  };
}) {
  return (
    <li className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
      <p className="text-sm font-medium text-zinc-900">
        {MODE_LABELS[e.mode as EngagementMode] || e.mode}
      </p>
      {e.scopeValue && (
        <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
          {e.scopeValue.includes(".") ? (
            <DomainReferralLink domain={e.scopeValue} className="hover:underline">
              {formatDomainDisplay(e.scopeValue)}
            </DomainReferralLink>
          ) : (
            e.scopeValue
          )}
        </p>
      )}
      <p className="mt-1 text-[11px] text-zinc-400">{statusLabel(e.status)}</p>
    </li>
  );
}
