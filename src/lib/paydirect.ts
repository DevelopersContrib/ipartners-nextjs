import "server-only";
import { prisma } from "./db";
import { createEngagement } from "./engagements";
import { pushEngagementToGrowagent } from "./growagent";
import { notifyStatusChange } from "./campaigns";
import { normalizeSponsorDomain, sponsorTierAmount } from "./sponsor-pricing";
import { isSponsorTier } from "./admin-client";
export { verifyPaydirectSignature } from "./paydirect-webhook";

/** Stored checkout metadata, used to recover scope on later webhook deliveries. */
function parseStoredMetadata(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export const PAYDIRECT_API_ORIGIN = "https://www.paydirect.com";

/** Secret PayDirect key. Server-side only — the browser reaches PayDirect through
 *  /api/paydirect, so this value must never be handed to a client component. */
export function paydirectApiKey(): string {
  return process.env.PAYDIRECT_API_KEY?.trim() || "";
}

export function paydirectConfigured(): boolean {
  return Boolean(paydirectApiKey());
}

const PAYDIRECT_STATUS_RANK: Record<string, number> = {
  created: 0,
  failed: 1,
  expired: 1,
  confirmed: 2,
  forwarded: 3,
};

export function resolvePaydirectStatus(
  current: string | null | undefined,
  incoming: string | null | undefined,
): string {
  const currentStatus = (current || "created").trim().toLowerCase();
  const incomingStatus = (incoming || "created").trim().toLowerCase();
  const safeIncoming =
    incomingStatus in PAYDIRECT_STATUS_RANK ? incomingStatus : "created";
  const safeCurrent =
    currentStatus in PAYDIRECT_STATUS_RANK ? currentStatus : "created";
  return PAYDIRECT_STATUS_RANK[safeIncoming] > PAYDIRECT_STATUS_RANK[safeCurrent]
    ? safeIncoming
    : safeCurrent;
}

function amountsMatch(expected: string, actual: string): boolean {
  const expectedCents = Math.round(Number(expected) * 100);
  const actualCents = Math.round(Number(actual) * 100);
  return (
    Number.isSafeInteger(expectedCents) &&
    Number.isSafeInteger(actualCents) &&
    expectedCents === actualCents
  );
}

export async function recordPaydirectPayment(input: {
  providerPaymentId: string;
  email: string;
  amount: string;
  tier?: string | null;
  vertical?: string | null;
  paymentMethod?: string | null;
  status?: string;
  engagementId?: string | null;
  metadata?: Record<string, string>;
}) {
  const email = input.email.trim().toLowerCase();
  const metadataJson = input.metadata
    ? JSON.stringify(input.metadata).slice(0, 60_000)
    : null;

  const engagementId =
    input.engagementId && /^\d+$/.test(input.engagementId)
      ? BigInt(input.engagementId)
      : null;
  const existing = await prisma.ippPayment.findUnique({
    where: {
      provider_providerPaymentId: {
        provider: "paydirect",
        providerPaymentId: input.providerPaymentId,
      },
    },
    select: { status: true },
  });
  const status = resolvePaydirectStatus(existing?.status, input.status);

  return prisma.ippPayment.upsert({
    where: {
      provider_providerPaymentId: {
        provider: "paydirect",
        providerPaymentId: input.providerPaymentId,
      },
    },
    create: {
      email,
      provider: "paydirect",
      providerPaymentId: input.providerPaymentId,
      status,
      tier: input.tier?.toLowerCase() || null,
      vertical: input.vertical || null,
      amount: input.amount,
      currency: "USD",
      paymentMethod: input.paymentMethod || null,
      engagementId,
      metadataJson,
    },
    update: {
      status,
      paymentMethod: input.paymentMethod || undefined,
      ...(engagementId ? { engagementId } : {}),
      ...(metadataJson ? { metadataJson } : {}),
    },
  });
}

/**
 * On payment.forwarded / confirmed: ensure sponsor engagement exists and is approved.
 * status "created" only records the payment row.
 */
export async function fulfillSponsorPayment(opts: {
  providerPaymentId: string;
  status: string;
  amount?: string;
  paymentMethod?: string | null;
  metadata?: Record<string, string>;
}) {
  const existing = await prisma.ippPayment.findUnique({
    where: {
      provider_providerPaymentId: {
        provider: "paydirect",
        providerPaymentId: opts.providerPaymentId,
      },
    },
  });

  // Webhook metadata wins; fall back to what checkout stored on the payment row.
  const meta: Record<string, string> = {
    ...parseStoredMetadata(existing?.metadataJson ?? null),
    ...(opts.metadata || {}),
  };

  const email = (meta.email || existing?.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    console.error("[paydirect] fulfill missing email for", opts.providerPaymentId);
    return { ok: false as const, reason: "missing email" };
  }

  const tierRaw = (meta.tier || existing?.tier || "").toLowerCase();
  const tier = isSponsorTier(tierRaw) ? tierRaw : null;
  const vertical = meta.vertical || existing?.vertical || null;

  // Placement scope: one domain, or the whole category (default).
  const scopedDomain =
    meta.scope_type === "domain" ? normalizeSponsorDomain(meta.scope_value) : "";
  const scopeType = scopedDomain ? "domain" : "vertical";
  const scopeValue = scopedDomain || vertical;

  const amount =
    opts.amount ||
    existing?.amount ||
    (tier ? sponsorTierAmount(tier) : null) ||
    "0";
  const canonicalAmount = tier ? sponsorTierAmount(tier) : null;

  const payment = await recordPaydirectPayment({
    providerPaymentId: opts.providerPaymentId,
    email,
    amount,
    tier,
    vertical,
    paymentMethod: opts.paymentMethod || existing?.paymentMethod,
    status: opts.status,
    engagementId: existing?.engagementId
      ? String(existing.engagementId)
      : meta.engagement_id,
    metadata: meta,
  });

  const shouldApprove =
    opts.status === "forwarded" || opts.status === "confirmed";

  if (!shouldApprove || !tier) {
    return { ok: true as const, payment, engagementId: null, approved: false };
  }
  if (!scopeValue) {
    return {
      ok: false as const,
      reason: "missing sponsor scope",
      payment,
      engagementId: null,
      approved: false,
    };
  }
  if (!canonicalAmount || !amountsMatch(canonicalAmount, amount)) {
    console.error(
      `[paydirect] amount mismatch for ${opts.providerPaymentId}: expected ${canonicalAmount || "unknown"}, got ${amount}`,
    );
    return {
      ok: false as const,
      reason: "payment amount does not match tier",
      payment,
      engagementId: null,
      approved: false,
    };
  }

  // Find open sponsor engagement or create one.
  let engagement =
    payment.engagementId != null
      ? await prisma.ippEngagement.findFirst({
          where: {
            id: payment.engagementId,
            email,
            mode: "sponsor",
            status: { in: ["pending", "approved", "active"] },
            scopeValue,
          },
        })
      : await prisma.ippEngagement.findFirst({
          where: {
            email,
            mode: "sponsor",
            status: { in: ["pending", "approved", "active"] },
            scopeValue,
          },
          orderBy: { id: "desc" },
        });

  if (!engagement) {
    try {
      engagement = await createEngagement({
        email,
        mode: "sponsor",
        scopeType,
        scopeValue,
        status: "pending",
        tier,
        sourceTable: "ipp_payment",
        sourceId: Number(payment.id),
        applicationJson: {
          mode: "sponsor",
          tier,
          vertical,
          scope_type: scopeType,
          scope_value: scopeValue,
          paydirect_payment_id: opts.providerPaymentId,
          source: "paydirect_checkout",
        },
      });
    } catch (err) {
      // Concurrent duplicate webhook: uq_source lets only one create win.
      if (
        !err ||
        typeof err !== "object" ||
        !("code" in err) ||
        err.code !== "P2002"
      ) {
        throw err;
      }
      engagement = await prisma.ippEngagement.findUnique({
        where: {
          sourceTable_sourceId: {
            sourceTable: "ipp_payment",
            sourceId: payment.id,
          },
        },
      });
      if (!engagement) throw err;
    }
  }

  const previous = engagement.status;
  const approval = await prisma.ippEngagement.updateMany({
    where: {
      id: engagement.id,
      status: { notIn: ["approved", "active"] },
    },
    data: {
      status: "approved",
      tier,
      scopeType,
      scopeValue,
    },
  });
  if (approval.count === 1) {
    // updateMany is the side-effect claim: concurrent duplicate deliveries can
    // both reach here, but only the pending -> approved winner sends/pushes.
    void notifyStatusChange(
      [engagement.id],
      "approved",
      new Map([[String(engagement.id), previous]]),
    ).catch((err) => console.error("[paydirect] notify failed:", err));

    void pushEngagementToGrowagent({
      email,
      engagementId: engagement.id,
      mode: "sponsor",
      scopeValue,
      status: "approved",
      tier,
    }).catch((err) => console.error("[paydirect] growagent failed:", err));
  }

  await prisma.ippPayment.update({
    where: { id: payment.id },
    data: {
      engagementId: engagement.id,
      status: payment.status,
    },
  });

  return {
    ok: true as const,
    payment,
    engagementId: String(engagement.id),
    approved:
      approval.count === 1 ||
      previous === "approved" ||
      previous === "active",
  };
}
