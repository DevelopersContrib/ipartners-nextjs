import "server-only";
import { prisma, ensurePrismaConnected } from "./db";
import { getTrafficForDomains } from "./partner-traffic";

export type TriageRow = {
  id: bigint;
  email: string;
  mode: string;
  scopeType: string;
  scopeValue: string | null;
  status: string;
  tier: string | null;
  memberId: bigint | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RankedTriageRow = TriageRow & {
  triageScore: number;
  ageDays: number;
  completeness: number;
  visitors30d: number;
};

/** Profile / scope / identity completeness 0–30. */
export function completenessPoints(row: {
  scopeValue: string | null;
  memberId: bigint | null;
  mode: string;
  tier: string | null;
}): number {
  let pts = 0;
  if (row.scopeValue?.trim()) pts += 12;
  if (row.memberId != null) pts += 10;
  if (row.mode && row.mode !== "builder") pts += 4;
  if (row.mode === "sponsor" && row.tier) pts += 4;
  return pts;
}

/**
 * Higher = review sooner.
 * Age (0–40) + completeness (0–30) + traffic signal (0–30).
 */
export function triageScoreFor(
  row: TriageRow,
  visitors30d = 0,
): { score: number; ageDays: number; completeness: number } {
  const ageDays = Math.max(
    0,
    (Date.now() - row.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const agePts = Math.min(40, ageDays * 1.5);
  const completeness = completenessPoints(row);
  let trafficPts = 0;
  if (visitors30d > 0) {
    trafficPts = Math.min(30, Math.log10(visitors30d + 1) * 8);
  } else if (row.scopeValue?.includes(".")) {
    trafficPts = 2; // known domain, no traffic yet
  }
  return {
    score: Math.round(agePts + completeness + trafficPts),
    ageDays: Math.round(ageDays * 10) / 10,
    completeness,
  };
}

export async function rankEngagementsForTriage(
  rows: TriageRow[],
): Promise<RankedTriageRow[]> {
  const domains = rows
    .map((r) => r.scopeValue)
    .filter((v): v is string => !!v && v.includes("."));
  const traffic = await getTrafficForDomains(domains);

  const ranked = rows.map((row) => {
    const host = row.scopeValue?.toLowerCase() || "";
    const visitors30d = traffic[host]?.visitors30d ?? 0;
    const { score, ageDays, completeness } = triageScoreFor(row, visitors30d);
    return {
      ...row,
      triageScore: score,
      ageDays,
      completeness,
      visitors30d,
    };
  });

  ranked.sort(
    (a, b) =>
      b.triageScore - a.triageScore ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  );
  return ranked;
}

export type BacklogKpis = {
  pendingCount: number;
  medianPendingAgeDays: number | null;
  oldestPendingDays: number | null;
  approvedOrActiveThisWeek: number;
  declinedThisWeek: number;
  /** Approvals + declines this week (ops cadence target: 50). */
  decisionsThisWeek: number;
  sponsorPending: number;
  /** Approved but not yet live on network (awaiting manage-app publish / reconcile). */
  approvedAwaitingPublish: number;
};

/** Ops targets surfaced on /admin — tooling doesn't clear queues; cadence does. */
export const OPS_TARGETS = {
  dailyTriageTopN: 20,
  medianPendingAgeDaysMax: 14,
  decisionsPerWeek: 50,
} as const;

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export async function getBacklogKpis(): Promise<BacklogKpis> {
  const empty: BacklogKpis = {
    pendingCount: 0,
    medianPendingAgeDays: null,
    oldestPendingDays: null,
    approvedOrActiveThisWeek: 0,
    declinedThisWeek: 0,
    decisionsThisWeek: 0,
    sponsorPending: 0,
    approvedAwaitingPublish: 0,
  };

  try {
    await ensurePrismaConnected();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      pending,
      approvedOrActiveThisWeek,
      declinedThisWeek,
      sponsorPending,
      approvedAwaitingPublish,
    ] = await Promise.all([
      prisma.ippEngagement.findMany({
        where: { status: "pending" },
        select: { createdAt: true },
      }),
      prisma.ippEngagement.count({
        where: {
          status: { in: ["approved", "active"] },
          updatedAt: { gte: weekAgo },
        },
      }),
      prisma.ippEngagement.count({
        where: { status: "declined", updatedAt: { gte: weekAgo } },
      }),
      prisma.ippEngagement.count({
        where: { status: "pending", mode: "sponsor" },
      }),
      prisma.ippEngagement.count({
        where: { status: "approved" },
      }),
    ]);

    const ages = pending.map(
      (p) => (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const med = median(ages);

    return {
      pendingCount: pending.length,
      medianPendingAgeDays: med != null ? Math.round(med * 10) / 10 : null,
      oldestPendingDays:
        ages.length > 0 ? Math.round(Math.max(...ages) * 10) / 10 : null,
      approvedOrActiveThisWeek,
      declinedThisWeek,
      decisionsThisWeek: approvedOrActiveThisWeek + declinedThisWeek,
      sponsorPending,
      approvedAwaitingPublish,
    };
  } catch (err) {
    console.error("[admin-triage] getBacklogKpis failed:", err);
    return empty;
  }
}
