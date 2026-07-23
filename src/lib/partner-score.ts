/**
 * PartnerScore (0–100) — public qualification signal for vertical brands.
 *
 * Not Keep Score (renewal). This answers: "is this domain worth partnering on?"
 *
 *   Traffic (40)  — analytics.vnoc.com UV/PV 7d + 30d
 *   Network (20)  — approved / TV-derived partner count
 *   Demand (20)   — leads + offers
 *   Asset (20)    — Theoretical Value / asking price
 */

export type PartnerScoreBand =
  | "elite"
  | "strong"
  | "qualified"
  | "emerging"
  | "building";

export type PartnerScoreBreakdown = {
  traffic: number;
  network: number;
  demand: number;
  asset: number;
};

export type PartnerScoreResult = {
  partnerScore: number;
  band: PartnerScoreBand;
  label: string;
  breakdown: PartnerScoreBreakdown;
};

export type PartnerScoreInput = {
  uniqueVisitors7d?: number | null;
  uniqueVisitors30d?: number | null;
  pageviews7d?: number | null;
  pageviews30d?: number | null;
  partners?: number | null;
  leads?: number | null;
  offers?: number | null;
  theoreticalValue?: number | null;
  askingPrice?: number | null;
};

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
}

/** Log-scaled points: 0 → 0, fullAt → maxPts */
function logPoints(value: number, fullAt: number, maxPts: number): number {
  if (value <= 0 || fullAt <= 0) return 0;
  if (value >= fullAt) return maxPts;
  const log = Math.log10(Math.max(1, value));
  const logMax = Math.log10(fullAt);
  return Math.round((log / logMax) * maxPts);
}

export function partnerScoreBand(score: number): PartnerScoreBand {
  if (score >= 80) return "elite";
  if (score >= 65) return "strong";
  if (score >= 50) return "qualified";
  if (score >= 30) return "emerging";
  return "building";
}

const BAND_LABEL: Record<PartnerScoreBand, string> = {
  elite: "Elite — priority qualify",
  strong: "Strong — high-fit partner",
  qualified: "Qualified — good fit",
  emerging: "Emerging — early partner seat",
  building: "Building — open to operators",
};

export function computePartnerScore(input: PartnerScoreInput): PartnerScoreResult {
  const uv7 = n(input.uniqueVisitors7d);
  const uv30 = n(input.uniqueVisitors30d);
  const pv7 = n(input.pageviews7d);
  const pv30 = n(input.pageviews30d);

  // Traffic 40: weight recent UV heavily, then 30d UV, then pageviews
  const traffic = Math.min(
    40,
    logPoints(uv7, 10_000, 16) +
      logPoints(uv30, 50_000, 12) +
      logPoints(pv7, 25_000, 6) +
      logPoints(pv30, 100_000, 6),
  );

  const network = logPoints(n(input.partners), 40, 20);
  const demand = Math.min(
    20,
    logPoints(n(input.leads), 5_000, 12) + logPoints(n(input.offers), 5_000, 8),
  );
  const assetValue = Math.max(n(input.theoreticalValue), n(input.askingPrice));
  const asset = logPoints(assetValue, 1_000_000, 20);

  const partnerScore = Math.min(100, traffic + network + demand + asset);
  const band = partnerScoreBand(partnerScore);

  return {
    partnerScore,
    band,
    label: BAND_LABEL[band],
    breakdown: { traffic, network, demand, asset },
  };
}
