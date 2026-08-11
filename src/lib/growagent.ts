import "server-only";

export type GrowagentPushInput = {
  email: string;
  name?: string | null;
  engagementId: string | number | bigint;
  mode: string;
  scopeValue?: string | null;
  status: string;
  tier?: string | null;
};

export type GrowagentPushResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  leadId?: number;
};

function growagentEnabled(): boolean {
  const flag = (process.env.GROWAGENT_PUSH_ENABLED || "true")
    .trim()
    .toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  return Boolean(
    process.env.GROWAGENT_BASE_URL?.trim() &&
      process.env.GROWAGENT_CAMPAIGN_ID?.trim(),
  );
}

/**
 * Push an approved (or ready) partner into Growagent for deeper AI nurture.
 * Fire-and-forget safe — never throws to callers.
 */
export async function pushEngagementToGrowagent(
  input: GrowagentPushInput,
): Promise<GrowagentPushResult> {
  if (!growagentEnabled()) {
    return { ok: true, skipped: true, reason: "growagent push not configured" };
  }

  const base = process.env.GROWAGENT_BASE_URL!.replace(/\/$/, "");
  const campaignId = Number(process.env.GROWAGENT_CAMPAIGN_ID);
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return { ok: false, reason: "invalid GROWAGENT_CAMPAIGN_ID" };
  }

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, reason: "invalid email" };
  }

  const name = (input.name || "").trim() || email.split("@")[0];
  const notes = [
    `source=ipartner`,
    `engagement_id=${input.engagementId}`,
    `mode=${input.mode}`,
    input.scopeValue ? `scope=${input.scopeValue}` : null,
    `status=${input.status}`,
    input.tier ? `tier=${input.tier}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const secret = process.env.GROWAGENT_INGEST_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) headers.Authorization = `Bearer ${secret}`;

  try {
    // Prefer import endpoint (supports notes); fall back to /api/leads.
    const importUrl = `${base}/api/leads/import`;
    let res = await fetch(importUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        campaign_id: campaignId,
        fields: {
          name,
          email,
          notes,
          status: "Not contacted",
        },
      }),
    });

    if (res.status === 404) {
      res = await fetch(`${base}/api/leads`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          campaign_id: campaignId,
          leads: [{ name, email }],
        }),
      });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[growagent] push failed ${res.status} for ${email}:`,
        text.slice(0, 300),
      );
      return { ok: false, reason: `HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as {
      id?: number;
      ids?: number[];
    };
    const leadId = data.id ?? data.ids?.[0];
    console.log(
      `[growagent] pushed ${email} engagement #${input.engagementId} → campaign ${campaignId}`,
    );
    return { ok: true, leadId };
  } catch (err) {
    console.error("[growagent] push error:", err);
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "push failed",
    };
  }
}

export async function pushApprovedEngagementsToGrowagent(
  ids: bigint[],
): Promise<void> {
  if (ids.length === 0 || !growagentEnabled()) return;

  const { prisma } = await import("./db");
  const rows = await prisma.ippEngagement.findMany({
    where: { id: { in: ids }, status: "approved" },
  });

  await Promise.all(
    rows.map(async (row) => {
      let name: string | null = null;
      try {
        const partner = await prisma.ippPartner.findUnique({
          where: { email: row.email },
          select: { firstName: true, lastName: true },
        });
        name = [partner?.firstName, partner?.lastName].filter(Boolean).join(" ");
      } catch {
        /* ignore */
      }
      await pushEngagementToGrowagent({
        email: row.email,
        name,
        engagementId: row.id,
        mode: row.mode,
        scopeValue: row.scopeValue,
        status: row.status,
        tier: row.tier,
      });
    }),
  );
}
