export const ENGAGEMENT_MODES = [
  "sponsor",
  "builder",
  "domain_owner",
  "app",
  "operator",
  "vendor",
  "referrer",
] as const;

export type EngagementMode = (typeof ENGAGEMENT_MODES)[number];

export const MODE_LABELS: Record<EngagementMode, string> = {
  sponsor: "Sponsor",
  builder: "Builder",
  domain_owner: "Domain owner",
  app: "App partner",
  operator: "Operator",
  vendor: "Vendor",
  referrer: "Referrer",
};

/** Short copy for marketing pickers (apply, about, legacy landers). */
export const MODE_DESCRIPTIONS: Record<EngagementMode, string> = {
  sponsor:
    "Category placement across a vertical — Bronze, Silver, or Gold (annual).",
  builder: "Equity-style partnership. Help grow a domain brand with us.",
  domain_owner: "Bring a premium name into the network and activate it.",
  app: "Ship or distribute an app across ventures that need it.",
  operator: "Lead day-to-day execution on a venture brand.",
  vendor: "Offer products or services across ventures that need you.",
  referrer: "Send traffic and introductions. Earn when they convert.",
};

/** Modes shown on the public apply picker (ordered for conversion). */
export const APPLY_PICKER_MODES: EngagementMode[] = [
  "sponsor",
  "builder",
  "domain_owner",
  "referrer",
  "vendor",
  "operator",
  "app",
];

export function coerceMode(raw?: string | null): EngagementMode | undefined {
  if (!raw) return undefined;
  const t = raw.trim().toLowerCase().replace(/-/g, "_");
  if (t === "sponsorship") return "sponsor";
  if (t === "affiliate" || t === "distribution") return "referrer";
  if (t === "added_value") return "builder";
  if (t === "domain") return "domain_owner";
  if (t === "apps") return "app";
  if (t === "leaders") return "operator";
  if (t === "product_service") return "vendor";
  return (ENGAGEMENT_MODES as readonly string[]).includes(t)
    ? (t as EngagementMode)
    : undefined;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Approved (awaiting publish)";
    case "active":
      return "Active (live)";
    case "pending":
      return "Under review";
    case "declined":
      return "Declined";
    case "lapsed":
      return "Lapsed";
    default:
      return status;
  }
}

export function normalizeStatus(raw: unknown): string {
  if (raw == null) return "pending";
  if (typeof raw === "number") {
    if (raw === 1 || raw === 2) return "approved";
    return "pending";
  }
  const s = String(raw).trim().toLowerCase();
  if (!s || s === "new" || s === "0") return "pending";
  if (s === "approved" || s === "active" || s === "live") return "approved";
  if (s === "declined" || s === "rejected") return "declined";
  if (s === "for interview" || s === "interviewed") return "pending";
  return "pending";
}
