import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "./db";

// HMAC-signed cookie sessions. Identity is the partner's EMAIL — resolved
// against the existing contrib `Members` store, so a returning partner's
// history (MarketPartnership + IPartner applications) is available immediately.
// No new partner silo, and no password anywhere.

const COOKIE = "ipp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

function verifyToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const a = Buffer.from(mac);
  const b = Buffer.from(sign(value));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("base64url");

export async function createSession(email: string): Promise<void> {
  const jar = await cookies();
  const value = email.toLowerCase();
  jar.set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type PartnerSession = {
  email: string;
  memberId: number | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
};

/** The signed-in partner, or null. Unknown emails are still valid sessions —
 *  a brand-new partner simply has no member record yet. */
export async function getCurrentPartner(): Promise<PartnerSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const email = verifyToken(token);
  if (!email) return null;

  try {
    const member = await prisma.members.findFirst({
      where: { EmailAddress: email },
      select: {
        MemberId: true,
        FirstName: true,
        LastName: true,
        CompanyName: true,
      },
    });
    return {
      email,
      memberId: member?.MemberId ?? null,
      firstName: member?.FirstName ?? null,
      lastName: member?.LastName ?? null,
      company: member?.CompanyName ?? null,
    };
  } catch {
    // DB hiccup shouldn't log the user out.
    return { email, memberId: null, firstName: null, lastName: null, company: null };
  }
}

export async function requirePartner(next = "/portal"): Promise<PartnerSession> {
  const { redirect } = await import("next/navigation");
  const partner = await getCurrentPartner();
  if (!partner) redirect(`/login?next=${encodeURIComponent(next)}`);
  return partner!;
}
