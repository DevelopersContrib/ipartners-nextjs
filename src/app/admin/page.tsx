import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin, ENGAGEMENT_STATUSES } from "@/lib/admin";
import { ENGAGEMENT_MODES } from "@/lib/engagement-modes";
import AdminQueue, { type QueueRow } from "./AdminQueue";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — iPartner",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mode?: string; q?: string; page?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const statusFilter =
    params.status === "all"
      ? "all"
      : params.status && ENGAGEMENT_STATUSES.includes(params.status as never)
        ? params.status
        : "pending";
  const mode = params.mode && (ENGAGEMENT_MODES as readonly string[]).includes(params.mode)
    ? params.mode
    : undefined;
  const q = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(mode ? { mode } : {}),
    ...(q
      ? { OR: [{ email: { contains: q } }, { scopeValue: { contains: q } }] }
      : {}),
  };

  const [rows, total, byStatus] = await Promise.all([
    prisma.ippEngagement.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.ippEngagement.count({ where }),
    prisma.ippEngagement.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const queueRows: QueueRow[] = rows.map((r) => ({
    id: String(r.id),
    email: r.email,
    mode: r.mode,
    scopeType: r.scopeType,
    scopeValue: r.scopeValue,
    status: r.status,
    tier: r.tier,
    createdAt: r.createdAt.toISOString(),
  }));

  const filterHref = (next: Record<string, string | undefined>) => {
    const merged = { status: statusFilter, mode, q, ...next };
    const sp = new URLSearchParams();
    if (merged.status) sp.set("status", merged.status);
    if (merged.mode) sp.set("mode", merged.mode);
    if (merged.q) sp.set("q", merged.q);
    if (next.page) sp.set("page", next.page);
    return `/admin?${sp.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ipp-text)]">Engagements</h1>
            <p className="text-sm text-[var(--ipp-secondary)] mt-1">
              Signed in as {admin.email} · full CRUD on{" "}
              <code className="font-mono text-xs">ipp_engagement</code>
              {" · "}
              <span className="font-medium">live widget publish stays in manage-app</span>
            </p>
          </div>
          <Link
            href="/admin/engagement/new"
            className="min-h-10 inline-flex items-center px-4 rounded-lg bg-[var(--ipp-primary)] text-white text-sm font-semibold"
          >
            New engagement
          </Link>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link
            href={filterHref({ status: "all", page: undefined })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border tabular-nums ${
              statusFilter === "all"
                ? "bg-[var(--ipp-primary)] text-white border-transparent"
                : "bg-white text-[var(--ipp-secondary)] border-[var(--border)] hover:text-[var(--ipp-text)]"
            }`}
          >
            all · {allCount.toLocaleString("en-US")}
          </Link>
          {ENGAGEMENT_STATUSES.map((s) => (
            <Link
              key={s}
              href={filterHref({ status: s, page: undefined })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize tabular-nums ${
                s === statusFilter
                  ? "bg-[var(--ipp-primary)] text-white border-transparent"
                  : "bg-white text-[var(--ipp-secondary)] border-[var(--border)] hover:text-[var(--ipp-text)]"
              }`}
            >
              {s} · {(counts[s] ?? 0).toLocaleString("en-US")}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={filterHref({ mode: undefined, page: undefined })}
            className={`px-2.5 py-1 rounded-md text-xs border ${!mode ? "bg-[var(--ipp-accent)]/20 border-[var(--ipp-accent)] text-[var(--ipp-text)]" : "bg-white border-[var(--border)] text-[var(--ipp-secondary)]"}`}
          >
            all modes
          </Link>
          {ENGAGEMENT_MODES.map((m) => (
            <Link
              key={m}
              href={filterHref({ mode: m, page: undefined })}
              className={`px-2.5 py-1 rounded-md text-xs border capitalize ${mode === m ? "bg-[var(--ipp-accent)]/20 border-[var(--ipp-accent)] text-[var(--ipp-text)]" : "bg-white border-[var(--border)] text-[var(--ipp-secondary)]"}`}
            >
              {m.replace("_", " ")}
            </Link>
          ))}
          <form action="/admin" className="ml-auto flex items-center gap-2">
            <input type="hidden" name="status" value={statusFilter} />
            {mode && <input type="hidden" name="mode" value={mode} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="email or domain…"
              className="min-h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm w-52"
            />
          </form>
        </div>

        <AdminQueue rows={queueRows} />

        {pages > 1 && (
          <div className="flex items-center justify-between text-sm text-[var(--ipp-secondary)]">
            <span className="tabular-nums">
              {total.toLocaleString("en-US")} result{total === 1 ? "" : "s"} · page {page} of{" "}
              {pages.toLocaleString("en-US")}
            </span>
            <span className="flex gap-2">
              {page > 1 && (
                <Link href={filterHref({ page: String(page - 1) })} className="underline underline-offset-2">
                  &larr; Prev
                </Link>
              )}
              {page < pages && (
                <Link href={filterHref({ page: String(page + 1) })} className="underline underline-offset-2">
                  Next &rarr;
                </Link>
              )}
            </span>
          </div>
        )}

        <p className="text-xs text-[var(--ipp-secondary)]">
          Note: dates on backfilled rows reflect the migration, not the original application — use the
          source tables for historical timing.
        </p>
      </div>
    </main>
  );
}
