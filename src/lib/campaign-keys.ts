/** Client-safe campaign key list (no server-only imports). */

export const CAMPAIGN_KEYS = [
  "applied",
  "approved",
  "declined",
  "active",
  "lapsed",
] as const;

export type CampaignKey = (typeof CAMPAIGN_KEYS)[number];

export function isCampaignKey(v: string): v is CampaignKey {
  return (CAMPAIGN_KEYS as readonly string[]).includes(v);
}
