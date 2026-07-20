import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { prisma } from "./db";

/**
 * DomainDirectory → iPartner hand-off.
 *
 * DD's partner agent qualifies a prospect, then deep-links here to complete the
 * application:
 *
 *   {IPARTNER_LOGIN_URL}/continue?token=<signed>
 *     token payload: { email, domain, type, name, exp, nonce }
 *
 * Why signed: without it, anyone could craft ?email=someone@else.com and land in
 * that person's context. The HMAC proves DD vouched for these values.
 *
 * SECURITY POSTURE — the token is a bearer credential in a URL, and URLs leak
 * (Referer headers, proxy/server logs, browser history, forwarded links). So:
 *   • short TTL (15 min default)
 *   • single-use — the nonce is burned on redemption
 *   • redemption requires an explicit click ("Continue as …"), never on page load
 * That keeps "no cold login wall" without letting a forwarded link silently
 * become someone's session.
 */

const TTL_MS = 15 * 60 * 1000;

export type HandoffPayload = {
  email: string;
  domain?: string;
  /** One of the DD partnership types (sponsorship | distribution | affiliate | added-value). */
  type?: string;
  name?: string;
  source?: string;
  exp: number;
  nonce: string;
};

function secret(): string | null {
  return process.env.DD_HANDOFF_SECRET?.trim() || null;
}

const b64url = (buf: Buffer) => buf.toString("base64url");

/** Sign a hand-off token. (Used by DD; exported here so both sides share one implementation.) */
export function signHandoff(
  input: Omit<HandoffPayload, "exp" | "nonce">,
  ttlMs = TTL_MS,
): string | null {
  const key = secret();
  if (!key) return null;
  const payload: HandoffPayload = {
    ...input,
    email: input.email.trim().toLowerCase(),
    exp: Date.now() + ttlMs,
    nonce: randomBytes(12).toString("base64url"),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export type VerifyResult =
  | { ok: true; payload: HandoffPayload }
  | { ok: false; reason: "not_configured" | "malformed" | "bad_signature" | "expired" | "already_used" };

/** Verify signature + expiry. Does NOT burn the nonce — call redeemHandoff for that. */
export function verifyHandoff(token: string): VerifyResult {
  const key = secret();
  if (!key) return { ok: false, reason: "not_configured" };

  const idx = token.lastIndexOf(".");
  if (idx < 0) return { ok: false, reason: "malformed" };
  const body = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" };

  let payload: HandoffPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!payload?.email || !payload?.exp || !payload?.nonce) return { ok: false, reason: "malformed" };
  if (Date.now() > payload.exp) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

/**
 * Verify AND burn the nonce so a leaked link can't be replayed.
 * Reuses ipp_auth_codes as the nonce ledger (code='handoff') — no extra table.
 */
export async function redeemHandoff(token: string): Promise<VerifyResult> {
  const res = verifyHandoff(token);
  if (!res.ok) return res;

  const nonceKey = `handoff:${res.payload.nonce}`;
  try {
    // Insert fails on duplicate PK → token already redeemed.
    await prisma.ippAuthCode.create({
      data: {
        token: nonceKey,
        email: res.payload.email,
        code: "handoff",
        consumed: true,
        expiresAt: new Date(res.payload.exp),
      },
    });
  } catch {
    return { ok: false, reason: "already_used" };
  }
  return res;
}
