import type { Metadata } from "next";
import Link from "next/link";
import { prisma, ensurePrismaConnected } from "@/lib/db";
import { requireAdmin, ENGAGEMENT_STATUSES } from "@/lib/admin";
import { ENGAGEMENT_MODES } from "@/lib/engagement-modes";
import { getBacklogKpis, rankEngagementsForTriage, OPS_TARGETS } from "@/lib/admin-triage";
import { isFraudAiConfigured } from "@/lib/fraud-screen";
import AdminQueue, { type QueueRow } from "./AdminQueue";
import FraudSweep from "./FraudSweep";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — iPartner",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    mode?: string;
    q?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const admin = await requireAdmin();
  await ensurePrismaConnected();
  const params = await searchParams;

  const statusFilter =
    params.status === "all"
      ? "all"
      : params.status && ENGAGEMENT_STATUSES.includes(params.status as never)
        ? params.status
        : "pending";
  const mode =
    params.mode && (ENGAGEMENT_MODES as readonly string[]).includes(params.mode)
      ? params.mode
      : undefined;
  const q = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const sortTriage =
    params.sort === "newest"
      ? false
      : statusFilter === "pending" || params.sort === "triage";

  const where = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(mode ? { mode } : {}),
    ...(q
      ? { OR: [{ email: { contains: q } }, { scopeValue: { contains: q } }] }
      : {}),
  };

  const [rawRows, total, byStatus, kpis] = await Promise.all([
    prisma.ippEngagement.findMany({
      where,
      // Fetch a wider window when ranking pending so triage isn't page-local only.
      orderBy: { id: "desc" },
      skip: sortTriage ? 0 : (page - 1) * PAGE_SIZE,
      take: sortTriage ? Math.min(300, PAGE_SIZE * 6) : PAGE_SIZE,
    }),
    prisma.ippEngagement.count({ where }),
    prisma.ippEngagement.groupBy({ by: ["status"], _count: { _all: true } }),
    getBacklogKpis(),
  ]);

  const ranked = sortTriage
    ? await rankEngagementsForTriage(rawRows)
    : rawRows.map((r) => ({
        ...r,
        triageScore: 0,
        ageDays: 0,
        completeness: 0,
        visitors30d: 0,
      }));

  const pageSlice = sortTriage
    ? ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : ranked;

  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const queueRows: QueueRow[] = pageSlice.map((r) => ({
    id: String(r.id),
    email: r.email,
    mode: r.mode,
    scopeType: r.scopeType,
    scopeValue: r.scopeValue,
    status: r.status,
    tier: r.tier,
    createdAt: r.createdAt.toISOString(),
    triageScore: "triageScore" in r ? r.triageScore : undefined,
    ageDays: "ageDays" in r ? r.ageDays : undefined,
    visitors30d: "visitors30d" in r ? r.visitors30d : undefined,
  }));

  const filterHref = (next: Record<string, string | undefined>) => {
    const merged = {
      status: statusFilter,
      mode,
      q,
      sort: sortTriage ? "triage" : params.sort,
      ...next,
    };
    const sp = new URLSearchParams();
    if (merged.status) sp.set("status", merged.status);
    if (merged.mode) sp.set("mode", merged.mode);
    if (merged.q) sp.set("q", merged.q);
    if (merged.sort) sp.set("sort", merged.sort);
    if (next.page) sp.set("page", next.page);
    return `/admin?${sp.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ipp-text)]">Engagements</h1>
            <p className="mt-1 text-sm text-[var(--ipp-secondary)]">
              Signed in as {admin.email} · triage on{" "}
              <code className="font-mono text-xs">ipp_engagement</code>
              {" · "}
              <span className="font-medium">
                live widget publish stays in manage-app
              </span>
            </p>
          </div>
          <Link
            href="/admin/engagement/new"
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--ipp-primary)] px-4 text-sm font-semibold text-white"
          >
            New engagement
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <Kpi label="Pending" value={kpis.pendingCount} />
          <Kpi
            label="Median age"
            value={
              kpis.medianPendingAgeDays != null
                ? `${kpis.medianPendingAgeDays}d`
                : "—"
            }
            hint={`target <${OPS_TARGETS.medianPendingAgeDaysMax}d`}
            warn={
              kpis.medianPendingAgeDays != null &&
              kpis.medianPendingAgeDays > OPS_TARGETS.medianPendingAgeDaysMax
            }
          />
          <Kpi
            label="Oldest"
            value={
              kpis.oldestPendingDays != null ? `${kpis.oldestPendingDays}d` : "—"
            }
          />
          <Kpi
            label="Decisions/wk"
            value={kpis.decisionsThisWeek}
            hint={`target ${OPS_TARGETS.decisionsPerWeek}`}
            warn={kpis.decisionsThisWeek < OPS_TARGETS.decisionsPerWeek}
          />
          <Kpi label="Approved/wk" value={kpis.approvedOrActiveThisWeek} />
          <Kpi
            label="Awaiting publish"
            value={kpis.approvedAwaitingPublish}
            href={filterHref({ status: "approved", page: undefined })}
          />
          <Kpi
            label="Sponsor pending"
            value={kpis.sponsorPending}
            href={filterHref({ status: "pending", mode: "sponsor", page: undefined })}
          />
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ipp-secondary)]">
          <p className="font-semibold text-[var(--ipp-text)]">Operating rhythm</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
            <li>
              <strong className="font-medium text-[var(--ipp-text)]">Daily (~15 min):</strong>{" "}
              work the top {OPS_TARGETS.dailyTriageTopN} by triage score (pending queue,
              sort: triage).
            </li>
            <li>
              <strong className="font-medium text-[var(--ipp-text)]">Weekly:</strong> run
              AI fraud auto-decline (preview → CONFIRM) for disposable/spam junk, then a
              manual bulk-decline pass for anything left.
            </li>
            <li>
              Targets: median pending age under {OPS_TARGETS.medianPendingAgeDaysMax}{" "}
              days; {OPS_TARGETS.decisionsPerWeek} decisions/week. Nightly reconcile flips
              approved → active when MarketPartnership is published. Daily auto-messages
              nudge pending (3d+) and stalled approved (7d+).
            </li>
          </ul>
        </section>

        <FraudSweep aiConfigured={isFraudAiConfigured()} />

        <div className="flex flex-wrap gap-2">
          <Link
            href={filterHref({ status: "all", page: undefined })}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium tabular-nums ${
              statusFilter === "all"
                ? "border-transparent bg-[var(--ipp-primary)] text-white"
                : "border-[var(--border)] bg-white text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)]"
            }`}
          >
            all · {allCount.toLocaleString("en-US")}
          </Link>
          {ENGAGEMENT_STATUSES.map((s) => (
            <Link
              key={s}
              href={filterHref({ status: s, page: undefined })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize tabular-nums ${
                s === statusFilter
                  ? "border-transparent bg-[var(--ipp-primary)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)]"
              }`}
            >
              {s} · {(counts[s] ?? 0).toLocaleString("en-US")}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={filterHref({ mode: undefined, page: undefined })}
            className={`rounded-md border px-2.5 py-1 text-xs ${!mode ? "border-[var(--ipp-accent)] bg-[var(--ipp-accent)]/20 text-[var(--ipp-text)]" : "border-[var(--border)] bg-white text-[var(--ipp-secondary)]"}`}
          >
            all modes
          </Link>
          {ENGAGEMENT_MODES.map((m) => (
            <Link
              key={m}
              href={filterHref({ mode: m, page: undefined })}
              className={`rounded-md border px-2.5 py-1 text-xs capitalize ${mode === m ? "border-[var(--ipp-accent)] bg-[var(--ipp-accent)]/20 text-[var(--ipp-text)]" : "border-[var(--border)] bg-white text-[var(--ipp-secondary)]"}`}
            >
              {m.replace("_", " ")}
            </Link>
          ))}
          <Link
            href={filterHref({
              sort: sortTriage ? "newest" : "triage",
              page: undefined,
            })}
            className="rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs text-[var(--ipp-secondary)]"
          >
            sort: {sortTriage ? "triage score" : "newest"}
          </Link>
          <form action="/admin" className="ml-auto flex items-center gap-2">
            <input type="hidden" name="status" value={statusFilter} />
            {mode && <input type="hidden" name="mode" value={mode} />}
            {sortTriage && <input type="hidden" name="sort" value="triage" />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="email or domain…"
              className="min-h-10 w-52 rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            />
          </form>
        </div>

        {mode === "sponsor" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
            Sponsor interest queue — use <strong>Email invoice</strong> on approved rows
            (checkout not live). Do not backfill historical rows as sponsor.
          </p>
        )}

        <AdminQueue rows={queueRows} showTriage={sortTriage} />

        {pages > 1 && (
          <div className="flex items-center justify-between text-sm text-[var(--ipp-secondary)]">
            <span className="tabular-nums">
              {total.toLocaleString("en-US")} result{total === 1 ? "" : "s"} · page{" "}
              {page} of {pages.toLocaleString("en-US")}
              {sortTriage ? " · ranked from latest window" : ""}
            </span>
            <span className="flex gap-2">
              {page > 1 && (
                <Link
                  href={filterHref({ page: String(page - 1) })}
                  className="underline underline-offset-2"
                >
                  &larr; Prev
                </Link>
              )}
              {page < pages && (
                <Link
                  href={filterHref({ page: String(page + 1) })}
                  className="underline underline-offset-2"
                >
                  Next &rarr;
                </Link>
              )}
            </span>
          </div>
        )}

        <p className="text-xs text-[var(--ipp-secondary)]">
          Approved = accepted by iPartner. Active = live on the network after manage-app
          publish. Bulk approve/decline requires CONFIRM + reason.
        </p>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  href,
  hint,
  warn,
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
  warn?: boolean;
}) {
  const inner = (
    <>
      <p className="text-[11px] uppercase tracking-wider text-[var(--ipp-secondary)]">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${
          warn ? "text-amber-800" : "text-[var(--ipp-text)]"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10px] text-[var(--ipp-secondary)]">{hint}</p>
      )}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-[var(--border)] bg-white p-3 transition hover:border-[var(--ipp-primary)]/40"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-3">{inner}</div>
  );
}
