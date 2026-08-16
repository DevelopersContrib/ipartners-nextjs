import { NextRequest, NextResponse } from "next/server";
import { fulfillSponsorPayment } from "@/lib/paydirect";
import {
  dispatchPaydirectWebhook,
  paydirectWebhookAuthError,
} from "@/lib/paydirect-webhook";

export const dynamic = "force-dynamic";

/**
 * PayDirect outbound webhooks.
 * Register: POST https://www.paydirect.com/api/v1/webhooks
 *   url: https://www.ipartner.com/api/webhooks/paydirect
 *   events: ["payment.created","payment.confirmed","payment.forwarded","payment.failed","payment.expired"]
 * Store signingSecret as PAYDIRECT_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYDIRECT_WEBHOOK_SECRET?.trim();
  const rawBody = await req.text();
  const signature = req.headers.get("x-paydirect-signature");
  const authError = paydirectWebhookAuthError(secret, rawBody, signature);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status },
    );
  }

  try {
    const result = await dispatchPaydirectWebhook(
      rawBody,
      req.headers.get("x-paydirect-event"),
      fulfillSponsorPayment,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      received: true,
      ...(result.ignored ? { ignored: true } : {}),
    });
  } catch (err) {
    console.error("[paydirect webhook]", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
