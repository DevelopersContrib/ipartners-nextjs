import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./db";
import { createEngagement } from "./engagements";
import { pushEngagementToGrowagent } from "./growagent";
import { notifyStatusChange } from "./campaigns";
import { sponsorTierAmount } from "./sponsor-pricing";
import { isSponsorTier } from "./admin-client";

/** Publishable PayDirect key — prefer NEXT_PUBLIC_ for client; server may use PAYDIRECT_API_KEY. */
export function paydirectApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_PAYDIRECT_API_KEY?.trim() ||
    process.env.PAYDIRECT_API_KEY?.trim() ||
    ""
  );
}

export function paydirectConfigured(): boolean {
  return Boolean(paydirectApiKey());
}

export function verifyPaydirectSignature(
  secret: string,
  rawBody: string,
  signature: string | null,
): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature.trim(), "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
  const status = input.status || "created";
  const metadataJson = input.metadata
    ? JSON.stringify(input.metadata).slice(0, 60_000)
    : null;

  const engagementId =
    input.engagementId && /^\d+$/.test(input.engagementId)
      ? BigInt(input.engagementId)
      : null;

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
  const meta = opts.metadata || {};
  const existing = await prisma.ippPayment.findUnique({
    where: {
      provider_providerPaymentId: {
        provider: "paydirect",
        providerPaymentId: opts.providerPaymentId,
      },
    },
  });

  const email = (meta.email || existing?.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    console.error("[paydirect] fulfill missing email for", opts.providerPaymentId);
    return { ok: false as const, reason: "missing email" };
  }

  const tierRaw = (meta.tier || existing?.tier || "").toLowerCase();
  const tier = isSponsorTier(tierRaw) ? tierRaw : null;
  const vertical = meta.vertical || existing?.vertical || null;
  const amount =
    opts.amount ||
    existing?.amount ||
    (tier ? sponsorTierAmount(tier) : null) ||
    "0";

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

  // Find open sponsor engagement or create one.
  let engagement =
    payment.engagementId != null
      ? await prisma.ippEngagement.findUnique({
          where: { id: payment.engagementId },
        })
      : await prisma.ippEngagement.findFirst({
          where: {
            email,
            mode: "sponsor",
            status: { in: ["pending", "approved"] },
            ...(vertical ? { scopeValue: vertical } : {}),
          },
          orderBy: { id: "desc" },
        });

  if (!engagement) {
    engagement = await createEngagement({
      email,
      mode: "sponsor",
      scopeType: "vertical",
      scopeValue: vertical,
      status: "pending",
      tier,
      applicationJson: {
        mode: "sponsor",
        tier,
        vertical,
        paydirect_payment_id: opts.providerPaymentId,
        source: "paydirect_checkout",
      },
    });
  }

  const previous = engagement.status;
  if (previous !== "approved" && previous !== "active") {
    await prisma.ippEngagement.update({
      where: { id: engagement.id },
      data: {
        status: "approved",
        tier,
        scopeType: "vertical",
        scopeValue: vertical || engagement.scopeValue,
      },
    });
    void notifyStatusChange(
      [engagement.id],
      "approved",
      new Map([[String(engagement.id), previous]]),
    ).catch((err) => console.error("[paydirect] notify failed:", err));

    void pushEngagementToGrowagent({
      email,
      engagementId: engagement.id,
      mode: "sponsor",
      scopeValue: vertical || engagement.scopeValue,
      status: "approved",
      tier,
    }).catch((err) => console.error("[paydirect] growagent failed:", err));
  }

  await prisma.ippPayment.update({
    where: { id: payment.id },
    data: { engagementId: engagement.id, status: opts.status },
  });

  return {
    ok: true as const,
    payment,
    engagementId: String(engagement.id),
    approved: true,
  };
}
