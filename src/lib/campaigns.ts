import "server-only";
import { prisma } from "./db";
import { sendEmail, escapeHtml } from "./ses";
import { MODE_LABELS, type EngagementMode } from "./engagement-modes";
import {
  CAMPAIGN_KEYS,
  isCampaignKey,
  type CampaignKey,
} from "./campaign-keys";

export { CAMPAIGN_KEYS, isCampaignKey, type CampaignKey };

/** Map engagement status → partner-facing campaign (pending → applied). */
export function campaignForStatus(status: string): CampaignKey | null {
  switch (status) {
    case "pending":
      return "applied";
    case "approved":
      return "approved";
    case "declined":
      return "declined";
    case "active":
      return "active";
    case "lapsed":
      return "lapsed";
    default:
      return null;
  }
}

export type EngagementMailContext = {
  id: bigint | number | string;
  email: string;
  mode: string;
  scopeValue: string | null;
  status: string;
  tier?: string | null;
  firstName?: string | null;
};

export type CampaignSendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  messageId?: string;
};

function campaignsEnabled(): boolean {
  const flag = (process.env.CAMPAIGN_EMAILS_ENABLED || "true").trim().toLowerCase();
  return flag !== "0" && flag !== "false" && flag !== "off";
}

function portalUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://ipartner.com";
  return `${base}/portal`;
}

function modeLabel(mode: string): string {
  return MODE_LABELS[mode as EngagementMode] || mode.replace(/_/g, " ");
}

function scopeLine(e: EngagementMailContext): string {
  return e.scopeValue || "the iPartner network";
}

function buildTemplate(
  key: CampaignKey,
  e: EngagementMailContext
): { subject: string; html: string; text: string } {
  const name = (e.firstName || "").trim() || "there";
  const scope = escapeHtml(scopeLine(e));
  const mode = escapeHtml(modeLabel(e.mode));
  const portal = portalUrl();
  const tier =
    e.tier && e.mode === "sponsor"
      ? ` (${escapeHtml(e.tier)} tier)`
      : "";

  const wrap = (body: string) => `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Hi ${escapeHtml(name)},</h2>
      ${body}
      <p style="margin-top:24px">
        <a href="${escapeHtml(portal)}" style="color:#223843;font-weight:600">Open your partner portal</a>
      </p>
      <p style="margin-top:24px;color:#64748b;font-size:12px">— The iPartner team</p>
    </div>`;

  switch (key) {
    case "applied":
      return {
        subject: `We received your iPartner application — ${scopeLine(e)}`,
        html: wrap(`
          <p>Thanks for applying as a <strong>${mode}</strong> partner for <strong>${scope}</strong>${tier}.</p>
          <p>Our team will review your application and follow up with next steps.</p>
        `),
        text: `Hi ${name},\n\nThanks for applying as a ${modeLabel(e.mode)} partner for ${scopeLine(e)}. Our team will review and follow up.\n\nPortal: ${portal}\n\n— The iPartner team`,
      };
    case "approved":
      return {
        subject: `You're approved — ${scopeLine(e)}`,
        html: wrap(`
          <p>Great news — your <strong>${mode}</strong> partnership for <strong>${scope}</strong> has been <strong>approved</strong>.</p>
          <p>Sign in to your portal to see status and next steps.</p>
        `),
        text: `Hi ${name},\n\nYour ${modeLabel(e.mode)} partnership for ${scopeLine(e)} has been approved.\n\nPortal: ${portal}\n\n— The iPartner team`,
      };
    case "declined":
      return {
        subject: `Update on your iPartner application — ${scopeLine(e)}`,
        html: wrap(`
          <p>Thanks for your interest in partnering on <strong>${scope}</strong>.</p>
          <p>After review, we are not moving forward with this application at this time. You are welcome to apply again for another opportunity.</p>
        `),
        text: `Hi ${name},\n\nThanks for your interest in ${scopeLine(e)}. We are not moving forward with this application at this time.\n\nPortal: ${portal}\n\n— The iPartner team`,
      };
    case "active":
      return {
        subject: `Your partnership is active — ${scopeLine(e)}`,
        html: wrap(`
          <p>Your <strong>${mode}</strong> partnership for <strong>${scope}</strong> is now <strong>active</strong>.</p>
          <p>Check your portal anytime for status and updates.</p>
        `),
        text: `Hi ${name},\n\nYour ${modeLabel(e.mode)} partnership for ${scopeLine(e)} is now active.\n\nPortal: ${portal}\n\n— The iPartner team`,
      };
    case "lapsed":
      return {
        subject: `Partnership update — ${scopeLine(e)}`,
        html: wrap(`
          <p>Your <strong>${mode}</strong> partnership for <strong>${scope}</strong> is marked as <strong>lapsed</strong>.</p>
          <p>If this is unexpected or you'd like to renew, reply to this email or apply again from the portal.</p>
        `),
        text: `Hi ${name},\n\nYour ${modeLabel(e.mode)} partnership for ${scopeLine(e)} is marked as lapsed. Reply if you'd like to renew.\n\nPortal: ${portal}\n\n— The iPartner team`,
      };
  }
}

async function resolveFirstName(email: string): Promise<string | null> {
  const [local, member] = await Promise.all([
    prisma.ippPartner.findUnique({
      where: { email },
      select: { firstName: true },
    }),
    prisma.members.findFirst({
      where: { EmailAddress: email },
      select: { FirstName: true },
    }),
  ]);
  return local?.firstName || member?.FirstName || null;
}

/**
 * Send a lifecycle campaign for one engagement. Idempotent unless `force`.
 * Never throws — callers should not fail the primary write on mail errors.
 */
export async function sendEngagementCampaign(
  engagement: EngagementMailContext,
  campaignKey: CampaignKey,
  opts?: { force?: boolean; firstName?: string | null }
): Promise<CampaignSendResult> {
  if (!campaignsEnabled()) {
    return { ok: true, skipped: true, reason: "campaigns disabled" };
  }

  const engagementId = BigInt(engagement.id);
  const email = engagement.email.trim().toLowerCase();

  if (!opts?.force) {
    const existing = await prisma.ippCampaignSend.findUnique({
      where: {
        engagementId_campaignKey: { engagementId, campaignKey },
      },
    });
    if (existing?.sendStatus === "sent") {
      return { ok: true, skipped: true, reason: "already sent" };
    }
  }

  const firstName =
    opts?.firstName ?? engagement.firstName ?? (await resolveFirstName(email));
  const tpl = buildTemplate(campaignKey, { ...engagement, email, firstName });

  const { sent, messageId } = await sendEmail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    from: process.env.CAMPAIGN_FROM_EMAIL || process.env.SES_FROM_EMAIL,
  });

  const sendStatus = sent ? "sent" : "failed";
  const error = sent ? null : "SES did not send (check AWS creds / region)";

  await prisma.ippCampaignSend.upsert({
    where: {
      engagementId_campaignKey: { engagementId, campaignKey },
    },
    create: {
      engagementId,
      campaignKey,
      email,
      sendStatus,
      providerId: messageId ?? null,
      error,
    },
    update: {
      email,
      sendStatus,
      providerId: messageId ?? null,
      error,
      createdAt: new Date(),
    },
  });

  if (!sent) {
    console.error(`[campaign] ${campaignKey} failed for engagement #${engagementId} → ${email}`);
    return { ok: false, reason: error || "send failed" };
  }

  console.log(`[campaign] ${campaignKey} → ${email} (engagement #${engagementId})`);
  return { ok: true, messageId };
}

/** Fire the campaign that matches the engagement's current status. */
export async function notifyEngagementStatus(
  engagement: EngagementMailContext,
  opts?: { force?: boolean; firstName?: string | null }
): Promise<CampaignSendResult> {
  const key = campaignForStatus(engagement.status);
  if (!key) return { ok: true, skipped: true, reason: "no campaign for status" };
  return sendEngagementCampaign(engagement, key, opts);
}

/**
 * After a status change, notify only rows whose status actually changed.
 * Fire-and-forget safe: logs errors, never throws.
 */
export async function notifyStatusChange(
  ids: bigint[],
  newStatus: string,
  previousById?: Map<string, string>
): Promise<void> {
  const key = campaignForStatus(newStatus);
  if (!key || ids.length === 0) return;

  const rows = await prisma.ippEngagement.findMany({
    where: { id: { in: ids } },
  });

  await Promise.all(
    rows.map(async (row) => {
      const prev = previousById?.get(String(row.id));
      if (prev != null && prev === newStatus) return;
      // Don't re-send "applied" when resetting to pending after a prior review.
      if (key === "applied" && prev != null && prev !== "pending") return;

      try {
        await sendEngagementCampaign(
          {
            id: row.id,
            email: row.email,
            mode: row.mode,
            scopeValue: row.scopeValue,
            status: row.status,
            tier: row.tier,
          },
          key
        );
      } catch (err) {
        console.error(`[campaign] notify failed for #${row.id}:`, err);
      }
    })
  );
}
