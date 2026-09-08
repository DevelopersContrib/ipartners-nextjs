"use client";

/**
 * Client-safe GA4 funnel event emitter.
 *
 * GA4 only: `window.gtag("event", name, cleanParams)` when present.
 * No-op when GA is unset. Strips `undefined` values from params.
 * Never sends email, name, answers, payment id, or webhook payload.
 *
 * No new DB table — events live in GA4. Revenue stays in `ipp_payment`.
 */

export type MarketingEventName =
  | "match_complete"
  | "apply_submit"
  | "checkout_start"
  | "payment_recorded";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Strip `undefined` values so GA4 never sees them. Shallow copy only —
 * params should always be a flat record.
 */
function cleanParams(
  params?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function trackMarketingEvent(
  name: MarketingEventName,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, cleanParams(params));
}
