/** Client-safe engagement admin constants (no server-only imports). */

export const ENGAGEMENT_STATUSES = [
  "pending",
  "approved",
  "declined",
  "active",
  "lapsed",
] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];

export function isEngagementStatus(v: string): v is EngagementStatus {
  return (ENGAGEMENT_STATUSES as readonly string[]).includes(v);
}

export const SCOPE_TYPES = ["domain", "vertical", "network"] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export function isScopeType(v: string): v is ScopeType {
  return (SCOPE_TYPES as readonly string[]).includes(v);
}

export const SPONSOR_TIERS = ["bronze", "silver", "gold"] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export function isSponsorTier(v: string): v is SponsorTier {
  return (SPONSOR_TIERS as readonly string[]).includes(v);
}
