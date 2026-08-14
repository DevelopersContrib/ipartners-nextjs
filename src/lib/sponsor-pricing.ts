/** Client-safe sponsor pricing (annual USD). */

export const SPONSOR_TIER_PRICES_USD = {
  bronze: "500.00",
  silver: "2500.00",
  gold: "10000.00",
} as const;

export type PricedSponsorTier = keyof typeof SPONSOR_TIER_PRICES_USD;

export function sponsorTierAmount(tier: string): string | null {
  const key = tier.trim().toLowerCase() as PricedSponsorTier;
  return SPONSOR_TIER_PRICES_USD[key] ?? null;
}

export function sponsorCheckoutHref(opts: {
  tier: string;
  vertical?: string | null;
}): string {
  const sp = new URLSearchParams();
  sp.set("tier", opts.tier.trim().toLowerCase());
  if (opts.vertical?.trim()) sp.set("vertical", opts.vertical.trim());
  return `/checkout/sponsor?${sp.toString()}`;
}
