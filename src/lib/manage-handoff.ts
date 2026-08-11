/**
 * Manage-app publish handoff (read-only from iPartner).
 * Never writes MarketPartnership — ops publish in manage-app.
 */

export function manageAppBaseUrl(): string {
  return (
    process.env.MANAGE_APP_BASE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_MANAGE_APP_URL?.replace(/\/$/, "") ||
    "https://manage.vnoc.com"
  );
}

/** Deep-link helpers for ops after engagement is approved. */
export function manageAppPublishHref(opts: {
  email: string;
  domain?: string | null;
  engagementId: string;
}): string {
  const base = manageAppBaseUrl();
  const sp = new URLSearchParams({
    email: opts.email,
    source: "ipartner",
    engagement_id: opts.engagementId,
  });
  if (opts.domain?.includes(".")) sp.set("domain", opts.domain);
  return `${base}/partners?${sp.toString()}`;
}

export const STATUS_MEANING = {
  pending: "Under review by iPartner",
  approved: "Accepted by iPartner — awaiting network publish in manage-app",
  active: "Live on the network (widget / partnership published)",
  declined: "Not moving forward",
  lapsed: "Previously active, no longer current",
} as const;
