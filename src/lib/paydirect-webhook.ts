import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export const PAYDIRECT_WEBHOOK_EVENTS = [
  "payment.created",
  "payment.confirmed",
  "payment.forwarded",
  "payment.failed",
  "payment.expired",
] as const;

export type PaydirectWebhookEvent = (typeof PAYDIRECT_WEBHOOK_EVENTS)[number];

export type PaydirectWebhookData = {
  id?: string;
  status?: string;
  grossAmount?: string;
  amount?: string;
  paymentProvider?: string;
  paymentMethod?: string;
  metadata?: Record<string, string>;
};

export type PaydirectFulfillInput = {
  providerPaymentId: string;
  status: string;
  amount?: string;
  paymentMethod?: string | null;
  metadata?: Record<string, string>;
};

export type PaydirectWebhookDispatch =
  | { ok: true; ignored: true; event: string }
  | { ok: true; ignored: false; event: PaydirectWebhookEvent }
  | { ok: false; status: 400; error: string };

export function verifyPaydirectSignature(
  secret: string,
  rawBody: string,
  signature: string | null,
): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const supplied = signature.trim();
    if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(supplied, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function paydirectWebhookAuthError(
  secret: string | undefined,
  rawBody: string,
  signature: string | null,
): { status: 503 | 401; error: string } | null {
  if (!secret?.trim()) {
    return { status: 503, error: "PayDirect webhook is not configured" };
  }
  if (!verifyPaydirectSignature(secret.trim(), rawBody, signature)) {
    return { status: 401, error: "Invalid signature" };
  }
  return null;
}

export async function dispatchPaydirectWebhook(
  rawBody: string,
  headerEvent: string | null,
  fulfill: (input: PaydirectFulfillInput) => Promise<unknown>,
): Promise<PaydirectWebhookDispatch> {
  let payload: { event?: string; data?: PaydirectWebhookData };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON" };
  }

  const event = (headerEvent || payload.event || "").trim();
  if (!(PAYDIRECT_WEBHOOK_EVENTS as readonly string[]).includes(event)) {
    return { ok: true, ignored: true, event };
  }

  const data = payload.data || {};
  const paymentId = data.id?.trim();
  if (!paymentId) {
    return { ok: false, status: 400, error: "missing payment id" };
  }

  const status = event.slice("payment.".length);
  const fulfillment = await fulfill({
    providerPaymentId: paymentId,
    status,
    amount: data.grossAmount || data.amount,
    paymentMethod: data.paymentMethod || data.paymentProvider || null,
    metadata: data.metadata || {},
  });
  if (
    fulfillment &&
    typeof fulfillment === "object" &&
    "ok" in fulfillment &&
    fulfillment.ok === false
  ) {
    const reason =
      "reason" in fulfillment && typeof fulfillment.reason === "string"
        ? fulfillment.reason
        : "fulfillment rejected";
    throw new Error(reason);
  }

  return {
    ok: true,
    ignored: false,
    event: event as PaydirectWebhookEvent,
  };
}
