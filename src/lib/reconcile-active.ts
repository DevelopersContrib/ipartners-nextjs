import "server-only";
import { prisma } from "./db";
import { notifyStatusChange } from "./campaigns";

function normDomain(raw: string | null | undefined): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/\.$/, "");
}

export type ReconcileResult = {
  scanned: number;
  activated: number;
  skippedNoDomain: number;
  skippedNoMember: number;
  skippedNoPublish: number;
  ids: string[];
  dryRun: boolean;
};

/**
 * Close approved → active when a published MarketPartnership exists
 * for the same member (via email) + domain. READ-ONLY on MarketPartnership.
 */
export async function reconcileApprovedToActive(opts?: {
  dryRun?: boolean;
  limit?: number;
}): Promise<ReconcileResult> {
  const dryRun = Boolean(opts?.dryRun);
  const limit = Math.min(Math.max(opts?.limit ?? 500, 1), 2000);

  const approved = await prisma.ippEngagement.findMany({
    where: { status: "approved" },
    orderBy: { updatedAt: "asc" },
    take: limit,
    select: {
      id: true,
      email: true,
      memberId: true,
      scopeType: true,
      scopeValue: true,
    },
  });

  const result: ReconcileResult = {
    scanned: approved.length,
    activated: 0,
    skippedNoDomain: 0,
    skippedNoMember: 0,
    skippedNoPublish: 0,
    ids: [],
    dryRun,
  };

  const toActivate: bigint[] = [];

  for (const row of approved) {
    const domain = normDomain(row.scopeValue);
    // Only auto-flip domain-scoped engagements (not vertical-only).
    if (!domain.includes(".")) {
      result.skippedNoDomain += 1;
      continue;
    }

    let memberId = row.memberId;
    if (memberId == null) {
      const member = await prisma.members.findFirst({
        where: { EmailAddress: row.email },
        select: { MemberId: true },
      });
      if (!member) {
        result.skippedNoMember += 1;
        continue;
      }
      memberId = BigInt(member.MemberId);
    }

    // Published inventory: MarketPartnership.approved = 1 (read-only).
    const published = await prisma.marketPartnership.findMany({
      where: { member_id: memberId, approved: 1 },
      select: { partner_id: true, domain: true },
      take: 100,
    });

    const matched = published.some((r) => normDomain(r.domain) === domain);
    if (!matched) {
      result.skippedNoPublish += 1;
      continue;
    }

    toActivate.push(row.id);
    result.ids.push(String(row.id));
  }

  if (dryRun || toActivate.length === 0) {
    result.activated = dryRun ? toActivate.length : 0;
    return result;
  }

  const previousById = new Map(toActivate.map((id) => [String(id), "approved"]));

  await prisma.ippEngagement.updateMany({
    where: { id: { in: toActivate }, status: "approved" },
    data: { status: "active" },
  });

  result.activated = toActivate.length;

  void notifyStatusChange(toActivate, "active", previousById).catch((err) =>
    console.error("[reconcile] campaign notify failed:", err),
  );

  console.log(
    `[reconcile] activated ${result.activated}/${result.scanned} approved→active`,
  );

  return result;
}
