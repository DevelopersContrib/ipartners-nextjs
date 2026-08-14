import { NextRequest, NextResponse } from "next/server";
import {
  fulfillSponsorPayment,
  verifyPaydirectSignature,
} from "@/lib/paydirect";

export const dynamic = "force-dynamic";

/**
 * PayDirect outbound webhooks.
 * Register: POST https://www.paydirect.com/api/v1/webhooks
 *   url: https://ipartner.com/api/webhooks/paydirect
 *   events: ["payment.confirmed","payment.forwarded","payment.failed","payment.created"]
 * Store signingSecret as PAYDIRECT_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYDIRECT_WEBHOOK_SECRET?.trim();
  const rawBody = await req.text();
  const signature = req.headers.get("x-paydirect-signature");
  const event =
    req.headers.get("x-paydirect-event") ||
    (() => {
      try {
        return (JSON.parse(rawBody) as { event?: string }).event || "";
      } catch {
        return "";
      }
    })();

  if (secret) {
    if (!verifyPaydirectSignature(secret, rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "[paydirect webhook] PAYDIRECT_WEBHOOK_SECRET unset — accepting without verify (dev only)",
    );
  }

  let payload: {
    event?: string;
    data?: {
      id?: string;
      status?: string;
      grossAmount?: string;
      amount?: string;
      paymentProvider?: string;
      paymentMethod?: string;
      metadata?: Record<string, string>;
    };
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event || payload.event || "";
  const data = payload.data || {};
  const paymentId = data.id;
  if (!paymentId) {
    return NextResponse.json({ error: "missing payment id" }, { status: 400 });
  }

  const method =
    data.paymentMethod ||
    data.paymentProvider ||
    null;

  try {
    if (
      type === "payment.forwarded" ||
      type === "payment.confirmed" ||
      type === "payment.created"
    ) {
      const status =
        type === "payment.forwarded"
          ? "forwarded"
          : type === "payment.confirmed"
            ? "confirmed"
            : "created";

      // Only fulfill (approve engagement) on confirmed/forwarded.
      if (status === "created") {
        // Soft record only if we have email in metadata
        const meta = data.metadata || {};
        if (meta.email) {
          await fulfillSponsorPayment({
            providerPaymentId: paymentId,
            status: "created",
            amount: data.grossAmount || data.amount,
            paymentMethod: method,
            metadata: meta,
          });
        }
      } else {
        await fulfillSponsorPayment({
          providerPaymentId: paymentId,
          status,
          amount: data.grossAmount || data.amount,
          paymentMethod: method,
          metadata: data.metadata || {},
        });
      }
    } else if (type === "payment.failed" || type === "payment.expired") {
      await fulfillSponsorPayment({
        providerPaymentId: paymentId,
        status: type === "payment.failed" ? "failed" : "expired",
        amount: data.grossAmount || data.amount,
        paymentMethod: method,
        metadata: data.metadata || {},
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paydirect webhook]", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
