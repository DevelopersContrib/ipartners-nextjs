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
  status: string
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

  const existing = await prisma.ippEngagement.findMany({
    where: { id: { in: parsed } },
    select: { id: true, status: true },
  });
  const previousById = new Map(existing.map((r) => [String(r.id), r.status]));

  const res = await prisma.ippEngagement.updateMany({
    where: { id: { in: parsed } },
    data: { status },
  });

  console.log(
    `[admin] ${admin.email} set ${res.count} engagement(s) -> ${status} [${parsed
      .slice(0, 10)
      .join(",")}${parsed.length > 10 ? ",…" : ""}]`
  );

  // Lifecycle campaigns (SES) — never block the admin write on mail failure.
  void notifyStatusChange(parsed, status, previousById).catch((err) =>
    console.error("[admin] campaign notify failed:", err)
  );

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
  if (input.mode !== "sponsor") tier = null;

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
      scopeValue: input.scopeValue.trim().slice(0, 255) || null,
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
