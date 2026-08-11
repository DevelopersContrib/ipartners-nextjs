import "server-only";
import { prisma } from "./db";
import { sendEngagementCampaign } from "./campaigns";
import { heuristicFraudSignal, shouldAutoDecline } from "./fraud-screen";
import type { NudgeCampaignKey } from "./campaign-keys";

/** Days after apply before pending nudge. */
export const NUDGE_PENDING_AFTER_DAYS = 3;
/** Days stuck in approved before go-live nudge. */
export const NUDGE_APPROVED_AFTER_DAYS = 7;

export type AutoMessageResult = {
  dryRun: boolean;
  scannedPending: number;
  scannedApproved: number;
  sent: number;
  skipped: number;
  failed: number;
  ids: string[];
};

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function autoMessagesEnabled(): boolean {
  const flag = (process.env.AUTO_MESSAGES_ENABLED || "true")
    .trim()
    .toLowerCase();
  return flag !== "0" && flag !== "false" && flag !== "off";
}

async function alreadySent(
  engagementId: bigint,
  campaignKey: NudgeCampaignKey,
): Promise<boolean> {
  const row = await prisma.ippCampaignSend.findUnique({
    where: {
      engagementId_campaignKey: { engagementId, campaignKey },
    },
    select: { sendStatus: true },
  });
  return row?.sendStatus === "sent";
}

/**
 * Status-tied auto messaging (SES nudges).
 * Idempotent via ipp_campaign_send. Skips disposable/junk emails.
 */
export async function runAutoMessages(opts?: {
  dryRun?: boolean;
  limit?: number;
}): Promise<AutoMessageResult> {
  const dryRun = Boolean(opts?.dryRun);
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 300);

  const result: AutoMessageResult = {
    dryRun,
    scannedPending: 0,
    scannedApproved: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    ids: [],
  };

  if (!autoMessagesEnabled() && !dryRun) {
    console.log("[auto-messages] disabled via AUTO_MESSAGES_ENABLED");
    return result;
  }

  const pendingCutoff = daysAgo(NUDGE_PENDING_AFTER_DAYS);
  const approvedCutoff = daysAgo(NUDGE_APPROVED_AFTER_DAYS);

  const [pending, approved] = await Promise.all([
    prisma.ippEngagement.findMany({
      where: {
        status: "pending",
        createdAt: { lte: pendingCutoff },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        email: true,
        mode: true,
        scopeValue: true,
        status: true,
        tier: true,
      },
    }),
    prisma.ippEngagement.findMany({
      where: {
        status: "approved",
        updatedAt: { lte: approvedCutoff },
      },
      orderBy: { updatedAt: "asc" },
      take: limit,
      select: {
        id: true,
        email: true,
        mode: true,
        scopeValue: true,
        status: true,
        tier: true,
      },
    }),
  ]);

  result.scannedPending = pending.length;
  result.scannedApproved = approved.length;

  type Target = {
    row: (typeof pending)[number];
    key: NudgeCampaignKey;
  };

  const targets: Target[] = [
    ...pending.map((row) => ({ row, key: "nudge_pending" as const })),
    ...approved.map((row) => ({ row, key: "nudge_approved" as const })),
  ];

  for (const { row, key } of targets) {
    const junk = heuristicFraudSignal({
      email: row.email,
      scopeValue: row.scopeValue,
    });
    if (junk && shouldAutoDecline(junk)) {
      result.skipped += 1;
      continue;
    }

    if (await alreadySent(row.id, key)) {
      result.skipped += 1;
      continue;
    }

    if (dryRun) {
      result.sent += 1;
      result.ids.push(`${key}:${row.id}`);
      continue;
    }

    const res = await sendEngagementCampaign(
      {
        id: row.id,
        email: row.email,
        mode: row.mode,
        scopeValue: row.scopeValue,
        status: row.status,
        tier: row.tier,
      },
      key,
    );

    if (res.ok && !res.skipped) {
      result.sent += 1;
      result.ids.push(String(row.id));
    } else if (res.skipped) {
      result.skipped += 1;
    } else {
      result.failed += 1;
    }
  }

  console.log(
    `[auto-messages] dryRun=${dryRun} pending=${result.scannedPending} approved=${result.scannedApproved} sent=${result.sent} skipped=${result.skipped} failed=${result.failed}`,
  );

  return result;
}
