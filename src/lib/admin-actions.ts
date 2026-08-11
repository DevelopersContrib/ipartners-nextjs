"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import {
  requireAdmin,
  isEngagementStatus,
  isEngagementMode,
  isScopeType,
  isSponsorTier,
} from "./admin";
import { createEngagement } from "./engagements";
import {
  notifyEngagementStatus,
  notifyStatusChange,
  isCampaignKey,
  sendEngagementCampaign,
} from "./campaigns";

/**
 * Full engagement admin — create / update / delete / status on ipp_engagement.
 * Never writes MarketPartnership (live widget on ~30k domains).
 */

const MAX_BULK = 200;

export type ActionResult = { ok: boolean; changed?: number; id?: string; error?: string };

function parseId(raw: string): bigint | null {
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(`${raw.trim()}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function revalidateEngagement(id?: string | bigint) {
  revalidatePath("/admin");
  if (id != null) revalidatePath(`/admin/engagement/${String(id)}`);
}

export async function setEngagementStatus(
  ids: string[],
  status: string,
  opts?: { reason?: string; confirmPhrase?: string; notify?: boolean }
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!isEngagementStatus(status)) return { ok: false, error: "Unknown status" };
  const parsed = [...new Set(ids)]
    .map(parseId)
    .filter((v): v is bigint => v !== null);

  if (parsed.length === 0) return { ok: false, error: "Nothing selected" };
  if (parsed.length > MAX_BULK) {
    return { ok: false, error: `Max ${MAX_BULK} at a time — keep bulk actions reviewable` };
  }

  // High-impact bulk requires explicit confirm + reason (decline always; approve when >1).
  const reason = (opts?.reason || "").trim();
  if (status === "declined") {
    if (reason.length < 3) {
      return { ok: false, error: "Decline requires a short reason (for ops log)" };
    }
  }
  if (
    (status === "approved" || status === "declined" || status === "active") &&
    parsed.length > 1
  ) {
    if ((opts?.confirmPhrase || "").trim().toUpperCase() !== "CONFIRM") {
      return {
        ok: false,
        error: 'Type CONFIRM to bulk-change approve/decline/active',
      };
    }
  }
  if (status === "approved" && parsed.length > 1 && reason.length < 3) {
    return { ok: false, error: "Bulk approve requires a short reason" };
  }

  const existing = await prisma.ippEngagement.findMany({
    where: { id: { in: parsed } },
    select: { id: true, status: true, email: true, mode: true, scopeValue: true },
  });
  const previousById = new Map(existing.map((r) => [String(r.id), r.status]));

  const res = await prisma.ippEngagement.updateMany({
    where: { id: { in: parsed } },
    data: { status },
  });

  console.log(
    `[admin] ${admin.email} set ${res.count} engagement(s) -> ${status} [${parsed
      .slice(0, 10)
      .join(",")}${parsed.length > 10 ? ",…" : ""}]${reason ? ` reason=${JSON.stringify(reason)}` : ""}`
  );

  // Lifecycle campaigns (SES) — skip for fraud sweeps (opts.notify === false).
  if (opts?.notify !== false) {
    void notifyStatusChange(parsed, status, previousById).catch((err) =>
      console.error("[admin] campaign notify failed:", err)
    );
  }

  // Approved → Growagent nurture (fire-and-forget).
  if (status === "approved") {
    void import("./growagent")
      .then(({ pushApprovedEngagementsToGrowagent }) =>
        pushApprovedEngagementsToGrowagent(parsed),
      )
      .catch((err) => console.error("[admin] growagent push failed:", err));
  }

  revalidateEngagement();
  return { ok: true, changed: res.count };
}

export type EngagementInput = {
  email: string;
  mode: string;
  scopeType: string;
  scopeValue: string;
  status: string;
  tier: string;
  termStart: string;
  termEnd: string;
};

function parseFields(input: EngagementInput): {
  ok: true;
  data: {
    email: string;
    mode: string;
    scopeType: string;
    scopeValue: string | null;
    status: string;
    tier: string | null;
    termStart: Date | null;
    termEnd: Date | null;
  };
} | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Valid email required" };
  if (!isEngagementMode(input.mode)) return { ok: false, error: "Unknown mode" };
  if (!isScopeType(input.scopeType)) return { ok: false, error: "Unknown scope type" };
  if (!isEngagementStatus(input.status)) return { ok: false, error: "Unknown status" };

  const tierRaw = input.tier.trim().toLowerCase();
  let tier: string | null = null;
  if (tierRaw) {
    if (!isSponsorTier(tierRaw)) return { ok: false, error: "Tier must be bronze, silver, or gold" };
    tier = tierRaw;
  }
  if (input.mode !== "sponsor") {
    tier = null;
  } else if (!tier) {
    return { ok: false, error: "Sponsor mode requires a tier (bronze, silver, or gold)" };
  }

  const scopeValue = input.scopeValue.trim().slice(0, 255) || null;
  if (input.mode === "sponsor" && !scopeValue) {
    return {
      ok: false,
      error: "Sponsor mode requires a vertical or domain in scope value",
    };
  }

  const termStart = parseDate(input.termStart);
  const termEnd = parseDate(input.termEnd);
  if (input.termStart?.trim() && !termStart) return { ok: false, error: "Invalid term start" };
  if (input.termEnd?.trim() && !termEnd) return { ok: false, error: "Invalid term end" };
  if (termStart && termEnd && termEnd < termStart) {
    return { ok: false, error: "Term end must be on or after term start" };
  }

  return {
    ok: true,
    data: {
      email,
      mode: input.mode,
      scopeType: input.scopeType,
      scopeValue,
      status: input.status,
      tier,
      termStart,
      termEnd,
    },
  };
}

/** FormData / object create — redirects to the new row on success. */
export async function createEngagementAdmin(
  input: EngagementInput
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = parseFields(input);
  if (!parsed.ok) return parsed;

  const row = await createEngagement({
    email: parsed.data.email,
    mode: parsed.data.mode as never,
    scopeType: parsed.data.scopeType as "domain" | "vertical" | "network",
    scopeValue: parsed.data.scopeValue,
    status: parsed.data.status,
    tier: parsed.data.tier,
  });

  await prisma.ippEngagement.update({
    where: { id: row.id },
    data: {
      termStart: parsed.data.termStart,
      termEnd: parsed.data.termEnd,
      sourceTable: "ipp_admin",
    },
  });

  void notifyEngagementStatus({
    id: row.id,
    email: parsed.data.email,
    mode: parsed.data.mode,
    scopeValue: parsed.data.scopeValue,
    status: parsed.data.status,
    tier: parsed.data.tier,
  }).catch((err) => console.error("[admin] campaign notify failed:", err));

  console.log(`[admin] ${admin.email} created engagement #${row.id} (${parsed.data.email})`);
  revalidateEngagement(row.id);
  redirect(`/admin/engagement/${row.id}`);
}

export async function updateEngagementAdmin(
  id: string,
  input: EngagementInput
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const engagementId = parseId(id);
  if (!engagementId) return { ok: false, error: "Invalid id" };

  const parsed = parseFields(input);
  if (!parsed.ok) return parsed;

  const member = await prisma.members.findFirst({
    where: { EmailAddress: parsed.data.email },
    select: { MemberId: true },
  });

  const previous = await prisma.ippEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!previous) return { ok: false, error: "Engagement not found" };

  try {
    await prisma.ippEngagement.update({
      where: { id: engagementId },
      data: {
        email: parsed.data.email,
        memberId: member ? BigInt(member.MemberId) : null,
        mode: parsed.data.mode,
        scopeType: parsed.data.scopeType,
        scopeValue: parsed.data.scopeValue,
        status: parsed.data.status,
        tier: parsed.data.tier,
        termStart: parsed.data.termStart,
        termEnd: parsed.data.termEnd,
      },
    });
  } catch {
    return { ok: false, error: "Engagement not found" };
  }

  if (previous.status !== parsed.data.status) {
    void notifyStatusChange(
      [engagementId],
      parsed.data.status,
      new Map([[String(engagementId), previous.status]])
    ).catch((err) => console.error("[admin] campaign notify failed:", err));

    if (parsed.data.status === "approved") {
      void import("./growagent")
        .then(({ pushApprovedEngagementsToGrowagent }) =>
          pushApprovedEngagementsToGrowagent([engagementId]),
        )
        .catch((err) => console.error("[admin] growagent push failed:", err));
    }
  }

  console.log(`[admin] ${admin.email} updated engagement #${engagementId}`);
  revalidateEngagement(engagementId);
  return { ok: true, id: String(engagementId) };
}

export async function resendEngagementCampaign(
  id: string,
  campaignKey: string
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const engagementId = parseId(id);
  if (!engagementId) return { ok: false, error: "Invalid id" };

  if (!isCampaignKey(campaignKey)) return { ok: false, error: "Unknown campaign" };

  const row = await prisma.ippEngagement.findUnique({ where: { id: engagementId } });
  if (!row) return { ok: false, error: "Engagement not found" };

  const res = await sendEngagementCampaign(
    {
      id: row.id,
      email: row.email,
      mode: row.mode,
      scopeValue: row.scopeValue,
      status: row.status,
      tier: row.tier,
    },
    campaignKey,
    { force: true }
  );

  console.log(
    `[admin] ${admin.email} resend ${campaignKey} for #${engagementId}: ${res.ok ? "ok" : res.reason}`
  );
  revalidateEngagement(engagementId);
  if (!res.ok) return { ok: false, error: res.reason || "Send failed" };
  return { ok: true, id: String(engagementId) };
}

/** MVP sponsor streamline: email invoice / payment next-steps (no checkout yet). */
export async function sendSponsorInvoice(
  id: string,
  opts?: { force?: boolean }
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const engagementId = parseId(id);
  if (!engagementId) return { ok: false, error: "Invalid id" };

  const row = await prisma.ippEngagement.findUnique({ where: { id: engagementId } });
  if (!row) return { ok: false, error: "Engagement not found" };
  if (row.mode !== "sponsor") {
    return { ok: false, error: "Sponsor invoice is only for sponsor mode" };
  }
  if (!row.tier) {
    return { ok: false, error: "Set a sponsor tier (bronze/silver/gold) first" };
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
    "sponsor_invoice",
    { force: opts?.force ?? true }
  );

  console.log(
    `[admin] ${admin.email} sponsor_invoice for #${engagementId}: ${res.ok ? "ok" : res.reason}`
  );
  revalidateEngagement(engagementId);
  if (!res.ok && !res.skipped) {
    return { ok: false, error: res.reason || "Send failed" };
  }
  return { ok: true, id: String(engagementId) };
}

export async function deleteEngagementAdmin(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const engagementId = parseId(id);
  if (!engagementId) return { ok: false, error: "Invalid id" };

  try {
    await prisma.ippCampaignSend.deleteMany({ where: { engagementId } });
    await prisma.ippEngagement.delete({ where: { id: engagementId } });
  } catch {
    return { ok: false, error: "Engagement not found" };
  }

  console.log(`[admin] ${admin.email} deleted engagement #${engagementId}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export type FraudSweepHit = {
  id: string;
  email: string;
  mode: string;
  scopeValue: string | null;
  reason: string;
  layer: string;
  confidence: number;
};

export type FraudSweepResult = {
  ok: boolean;
  dryRun: boolean;
  scanned: number;
  declined: number;
  skipped: number;
  hits: FraudSweepHit[];
  error?: string;
  aiEnabled?: boolean;
};

/**
 * Screen pending engagements for disposable/junk email + AI fraud signals.
 * Declines high-confidence hits. Skips SES (no decline email to throwaway inboxes).
 */
export async function autoDeclineFraud(opts: {
  dryRun: boolean;
  confirmPhrase?: string;
  limit?: number;
  useAi?: boolean;
}): Promise<FraudSweepResult> {
  const admin = await requireAdmin();
  const {
    heuristicFraudSignal,
    shouldAutoDecline,
    aiFraudSignal,
    isFraudAiConfigured,
  } = await import("./fraud-screen");
  const { getApplicationDetail } = await import("./application-detail");

  const useAi = opts.useAi !== false && isFraudAiConfigured();

  if (!opts.dryRun) {
    if ((opts.confirmPhrase || "").trim().toUpperCase() !== "CONFIRM") {
      return {
        ok: false,
        dryRun: false,
        scanned: 0,
        declined: 0,
        skipped: 0,
        hits: [],
        error: "Type CONFIRM to apply auto-declines",
        aiEnabled: useAi,
      };
    }
  }

  const pending = await prisma.ippEngagement.findMany({
    where: { status: "pending" },
    orderBy: { id: "asc" },
    // Heuristics are cheap — scan the full pending backlog (cap for safety).
    take: Math.min(Math.max(opts.limit ?? 5000, 1), 5000),
    select: {
      id: true,
      email: true,
      mode: true,
      scopeValue: true,
      tier: true,
      sourceTable: true,
      sourceId: true,
      applicationJson: true,
    },
  });

  const hits: FraudSweepHit[] = [];
  const toDecline: { id: bigint; reason: string }[] = [];
  const appTextById = new Map<string, string>();
  const needsAi: typeof pending = [];

  // Pass 1 — free heuristics across the whole pending set.
  for (const row of pending) {
    // Skip expensive application lookups for clear disposable emails.
    const quick = heuristicFraudSignal({
      email: row.email,
      scopeValue: row.scopeValue,
    });
    if (quick && shouldAutoDecline(quick)) {
      const reason = `[auto-fraud/${quick.layer}] ${quick.reason}`.slice(0, 280);
      hits.push({
        id: String(row.id),
        email: row.email,
        mode: row.mode,
        scopeValue: row.scopeValue,
        reason,
        layer: quick.layer,
        confidence: quick.confidence,
      });
      toDecline.push({ id: row.id, reason });
      continue;
    }

    // Only fetch application text when we may need AI / deeper heuristics.
    if (!useAi) continue;

    const detail = await getApplicationDetail({
      email: row.email,
      sourceTable: row.sourceTable,
      sourceId: row.sourceId,
      applicationJson: row.applicationJson,
    });
    const applicationText = detail.fields
      .map((f) => `${f.label}: ${f.value}`)
      .join("\n");
    appTextById.set(String(row.id), applicationText);

    const heuristic = heuristicFraudSignal({
      email: row.email,
      scopeValue: row.scopeValue,
      applicationText,
    });
    if (heuristic && shouldAutoDecline(heuristic)) {
      const reason = `[auto-fraud/${heuristic.layer}] ${heuristic.reason}`.slice(
        0,
        280,
      );
      hits.push({
        id: String(row.id),
        email: row.email,
        mode: row.mode,
        scopeValue: row.scopeValue,
        reason,
        layer: heuristic.layer,
        confidence: heuristic.confidence,
      });
      toDecline.push({ id: row.id, reason });
      continue;
    }

    needsAi.push(row);
  }

  // Pass 2 — AI on newest leftovers only (budget).
  const aiCandidates = needsAi.slice(-25);
  for (let i = 0; i < aiCandidates.length; i++) {
    const row = aiCandidates[i];
    const signal = await aiFraudSignal({
      email: row.email,
      mode: row.mode,
      scopeValue: row.scopeValue,
      tier: row.tier,
      applicationText: appTextById.get(String(row.id)) || "",
    });
    if (!signal || !shouldAutoDecline(signal)) continue;

    const reason = `[auto-fraud/${signal.layer}] ${signal.reason}`.slice(0, 280);
    hits.push({
      id: String(row.id),
      email: row.email,
      mode: row.mode,
      scopeValue: row.scopeValue,
      reason,
      layer: signal.layer,
      confidence: signal.confidence,
    });
    toDecline.push({ id: row.id, reason });
  }

  if (opts.dryRun || toDecline.length === 0) {
    console.log(
      `[admin] ${admin.email} fraud sweep dryRun=${opts.dryRun} scanned=${pending.length} hits=${hits.length} ai=${useAi}`,
    );
    return {
      ok: true,
      dryRun: opts.dryRun,
      scanned: pending.length,
      declined: 0,
      skipped: pending.length - hits.length,
      hits,
      aiEnabled: useAi,
    };
  }

  const ids = toDecline.map((t) => t.id);
  const res = await prisma.ippEngagement.updateMany({
    where: { id: { in: ids }, status: "pending" },
    data: { status: "declined" },
  });

  // No SES for fraud auto-declines — disposable inboxes + reputation.
  console.log(
    `[admin] ${admin.email} auto-declined ${res.count} fraud/junk engagement(s): ${hits
      .slice(0, 15)
      .map((h) => `${h.id}:${h.reason}`)
      .join(" | ")}`,
  );

  revalidatePath("/admin");
  return {
    ok: true,
    dryRun: false,
    scanned: pending.length,
    declined: res.count,
    skipped: pending.length - hits.length,
    hits,
    aiEnabled: useAi,
  };
}
