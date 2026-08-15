import { NextRequest, NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/auth";
import { paydirectApiKey, PAYDIRECT_API_ORIGIN } from "@/lib/paydirect";
import { isSponsorTier } from "@/lib/admin-client";
import { sponsorTierAmount } from "@/lib/sponsor-pricing";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy for the PayDirect widget API.
 *
 * PayDirect answers preflight with `Access-Control-Allow-Origin:
 * https://www.paydirect.com`, so a browser can never call it directly from our
 * origin. The widget supports this by taking a `baseUrl` and issuing
 * same-origin relative requests instead.
 *
 * Proxying also keeps the `pd_live_…` key on the server, and lets us pin the
 * amount and buyer email server-side rather than trusting the browser.
 */

type Ctx = { params: Promise<{ path: string[] }> };

const MAX_BODY_BYTES = 32_000;

/** Only the endpoints the checkout widget actually needs. */
function resolveUpstreamPath(
  segments: string[],
  method: "GET" | "POST",
): string | null {
  const path = segments.join("/");
  if (method === "POST" && path === "api/v1/payments") return "/api/v1/payments";
  if (method === "GET" && /^api\/v1\/payments\/[A-Za-z0-9_-]{1,128}$/.test(path)) {
    return `/${path}`;
  }
  return null;
}

/**
 * Never let the browser decide what a sponsorship costs or who it credits.
 * For our own sponsor product we recompute the amount from the tier and force
 * the buyer email to the session.
 */
function sanitizeSponsorBody(
  body: Record<string, unknown>,
  sessionEmail: string,
): Record<string, unknown> {
  const rawMeta = body.metadata;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === "object" && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  if (meta.product !== "ipartner_sponsor") return body;

  const tier = String(meta.tier || "").trim().toLowerCase();
  const amount = isSponsorTier(tier) ? sponsorTierAmount(tier) : null;
  if (!amount) return { ...body, metadata: { ...meta, email: sessionEmail } };

  return {
    ...body,
    amount,
    metadata: { ...meta, tier, email: sessionEmail },
  };
}

async function forward(req: NextRequest, ctx: Ctx, method: "GET" | "POST") {
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = paydirectApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "PayDirect is not configured" },
      { status: 503 },
    );
  }

  const upstreamPath = resolveUpstreamPath((await ctx.params).path || [], method);
  if (!upstreamPath) {
    return NextResponse.json({ error: "Unsupported path" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const idempotencyKey = req.headers.get("idempotency-key");
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 200);

  let upstreamBody: string | undefined;
  if (method === "POST") {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    upstreamBody = JSON.stringify(
      sanitizeSponsorBody(parsed as Record<string, unknown>, partner.email),
    );
  }

  try {
    const upstream = await fetch(`${PAYDIRECT_API_ORIGIN}${upstreamPath}`, {
      method,
      headers,
      body: upstreamBody,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[paydirect proxy]", err);
    return NextResponse.json({ error: "PayDirect unreachable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "POST");
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "GET");
}
