/**
 * Public marketing proof — static only.
 *
 * CONTENT RULE (Sprint Sep 7–11 · Story 2):
 * No fabricated logo, quote, traffic number, conversion rate, or ROI.
 * Every public entry MUST have written approval recorded below before
 * `status` is set to `"approved"`. Unapproved slots stay empty and are
 * not rendered as claims.
 *
 * Deadline: Tue Sep 8 noon — approved assets were not cleared, so the
 * homepage ships the factual "How sponsorship works" path and leaves
 * logo / quote / metric arrays empty until approvals land.
 *
 * Do NOT store this copy in ipp_engagement / ipp_payment / drip /
 * MarketPartnership.
 */

export type ProofApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovedLogo = {
  id: string;
  /** Display name for accessibility when an image is present. */
  name: string;
  /** Absolute or public path. Leave empty until asset is approved. */
  src: string;
  href?: string;
  status: ProofApprovalStatus;
  /** Written approval note — required before `approved`. */
  approvalNote: string;
};

export type ApprovedQuote = {
  id: string;
  quote: string;
  attribution: string;
  role: string;
  status: ProofApprovalStatus;
  approvalNote: string;
};

export type ApprovedMetric = {
  id: string;
  label: string;
  value: string;
  status: ProofApprovalStatus;
  approvalNote: string;
};

/**
 * Approved partner logos for the public homepage.
 * Keep empty until written approval exists for each asset.
 *
 * Approval backlog (not public yet):
 * - (none cleared as of sprint Story 2 ship)
 */
export const PROOF_LOGOS: ApprovedLogo[] = [
  // Example shape when approved:
  // {
  //   id: "acme",
  //   name: "Acme Co",
  //   src: "/proof/acme.svg",
  //   href: "https://example.com",
  //   status: "approved",
  //   approvalNote: "Email from brand@… on YYYY-MM-DD — logo use OK",
  // },
];

/**
 * Approved quotes. "Jordan P." was unverified — removed, not carried forward.
 */
export const PROOF_QUOTES: ApprovedQuote[] = [];

/** Approved public metrics. Empty until written approval. */
export const PROOF_METRICS: ApprovedMetric[] = [];

export function approvedLogos(): ApprovedLogo[] {
  return PROOF_LOGOS.filter((l) => l.status === "approved" && Boolean(l.src));
}

export function approvedQuotes(): ApprovedQuote[] {
  return PROOF_QUOTES.filter(
    (q) => q.status === "approved" && Boolean(q.quote),
  );
}

export function approvedMetrics(): ApprovedMetric[] {
  return PROOF_METRICS.filter(
    (m) => m.status === "approved" && Boolean(m.value),
  );
}

export type SponsorshipStep = {
  n: string;
  title: string;
  body: string;
};

/**
 * Factual process copy — not social proof. Safe to show without approvals.
 */
export const HOW_SPONSORSHIP_WORKS: SponsorshipStep[] = [
  {
    n: "01",
    title: "Pick a category",
    body: "Choose a vertical or a single premium domain. We publish the live domain count before you go live — no undisclosed inventory.",
  },
  {
    n: "02",
    title: "Choose a tier",
    body: "Bronze places your brand. Silver places you across the category with a monthly report. Gold adds exclusivity for the term.",
  },
  {
    n: "03",
    title: "Checkout or apply",
    body: "Pay annually via PayDirect (card or crypto), or apply if you need a custom scope. Sponsorship activates when payment settles and review clears.",
  },
  {
    n: "04",
    title: "Go live + report",
    body: "Your placement appears on category and partner slots. Silver and Gold include a monthly report — see the labeled sample for the format.",
  },
];

/** Public path for the labeled Silver sample report. */
export const SAMPLE_REPORT_HREF = "/sponsorship/sample-report" as const;
