/**
 * Inbound “catch” from network platforms (DomainDirectory, Contrib, etc.).
 *
 * Partners deep-link with:
 *   https://ipartner.com/?ref=domaindirectory.com
 *   https://ipartner.com/from/domaindirectory.com
 *   https://ipartner.com/apply?ref=domaindirectory.com&mode=sponsor
 *
 * We persist the bare hostname in cookie `ipp_ref` and stamp it on apply.
 */

export const IPP_REF_COOKIE = "ipp_ref";
export const IPP_REF_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

/** Known network platforms — shown with a friendly label on the catch banner/landing. */
export const INBOUND_PLATFORMS: Record<
  string,
  { label: string; blurb: string; home: string }
> = {
  "domaindirectory.com": {
    label: "DomainDirectory",
    blurb: "Premium domain inventory and partner hand-offs.",
    home: "https://www.domaindirectory.com/",
  },
  "contrib.com": {
    label: "Contrib",
    blurb: "Contributor network and venture collaboration.",
    home: "https://www.contrib.com/",
  },
  "referrals.com": {
    label: "Referrals.com",
    blurb: "Referral campaigns across the network.",
    home: "https://www.referrals.com/",
  },
  "vnoc.com": {
    label: "VNOC",
    blurb: "Venture operating system for digital assets.",
    home: "https://www.vnoc.com/",
  },
  "agentdao.com": {
    label: "AgentDAO",
    blurb: "AI-native entities and agent infrastructure.",
    home: "https://www.agentdao.com/",
  },
  "ventureos.com": {
    label: "VentureOS",
    blurb: "Turn URLs into autonomous ventures.",
    home: "https://www.ventureos.com/",
  },
  "ecorp.com": {
    label: "eCorp",
    blurb: "Smart Entity registry of record.",
    home: "https://www.ecorp.com/",
  },
  "paydirect.com": {
    label: "PayDirect",
    blurb: "Settlement and payouts for partner economies.",
    home: "https://www.paydirect.com/",
  },
};

export function normalizeInboundRef(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let host = raw.trim().toLowerCase();
  try {
    if (host.includes("://")) host = new URL(host).hostname;
  } catch {
    /* keep host as-is */
  }
  host = host
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
  // bare hostname only
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
    return null;
  }
  // don't attribute to ourselves
  if (host === "ipartner.com" || host === "ipartners.com" || host === "localhost") {
    return null;
  }
  return host;
}

export function inboundPlatformMeta(host: string) {
  const key = normalizeInboundRef(host);
  if (!key) return null;
  const known = INBOUND_PLATFORMS[key];
  return {
    host: key,
    label: known?.label ?? key,
    blurb: known?.blurb ?? "A partner platform in the network.",
    home: known?.home ?? `https://www.${key}/`,
    known: Boolean(known),
  };
}

export function readRefFromSearchParams(sp: URLSearchParams): string | null {
  return (
    normalizeInboundRef(sp.get("ref")) ||
    normalizeInboundRef(sp.get("from")) ||
    normalizeInboundRef(sp.get("utm_source")) ||
    normalizeInboundRef(sp.get("source"))
  );
}
