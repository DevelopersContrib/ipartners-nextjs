/** Client-safe campaign key list (no server-only imports). */

/** Status lifecycle emails (sent on status change). */
export const LIFECYCLE_CAMPAIGN_KEYS = [
  "applied",
  "approved",
  "declined",
  "active",
  "lapsed",
] as const;

/** Timed auto-messages (cron), still SES + ipp_campaign_send. */
export const NUDGE_CAMPAIGN_KEYS = [
  "nudge_pending",
  "nudge_approved",
] as const;

/** Ops-triggered extras (not tied to status). */
export const EXTRA_CAMPAIGN_KEYS = ["sponsor_invoice"] as const;

export const CAMPAIGN_KEYS = [
  ...LIFECYCLE_CAMPAIGN_KEYS,
  ...NUDGE_CAMPAIGN_KEYS,
  ...EXTRA_CAMPAIGN_KEYS,
] as const;

export type CampaignKey = (typeof CAMPAIGN_KEYS)[number];
export type LifecycleCampaignKey = (typeof LIFECYCLE_CAMPAIGN_KEYS)[number];
export type NudgeCampaignKey = (typeof NUDGE_CAMPAIGN_KEYS)[number];

export function isCampaignKey(v: string): v is CampaignKey {
  return (CAMPAIGN_KEYS as readonly string[]).includes(v);
}
