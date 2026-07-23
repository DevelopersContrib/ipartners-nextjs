import "server-only";
import { redirect } from "next/navigation";
import { getCurrentPartner, type PartnerSession } from "./auth";
import { ENGAGEMENT_MODES, type EngagementMode } from "./engagement-modes";
import {
  ENGAGEMENT_STATUSES,
  isEngagementStatus,
  SCOPE_TYPES,
  isScopeType,
  SPONSOR_TIERS,
  isSponsorTier,
  type EngagementStatus,
  type ScopeType,
  type SponsorTier,
} from "./admin-client";

export {
  ENGAGEMENT_STATUSES,
  isEngagementStatus,
  SCOPE_TYPES,
  isScopeType,
  SPONSOR_TIERS,
  isSponsorTier,
  type EngagementStatus,
  type ScopeType,
  type SponsorTier,
};

/**
 * Admin = a normal partner session whose email is on the ADMIN_EMAILS
 * allowlist (comma-separated, case-insensitive). No second auth system,
 * no admin passwords — the email-code login is the only door.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdmin(): Promise<PartnerSession | null> {
  const p = await getCurrentPartner();
  if (!p || !adminEmails().includes(p.email.toLowerCase())) return null;
  return p;
}

export async function requireAdmin(): Promise<PartnerSession> {
  const admin = await getAdmin();
  // Same redirect for "not signed in" and "not an admin" — don't reveal
  // which emails are on the list.
  if (!admin) redirect("/login?next=/admin");
  return admin;
}

export function isEngagementMode(v: string): v is EngagementMode {
  return (ENGAGEMENT_MODES as readonly string[]).includes(v);
}

export { ENGAGEMENT_MODES };
