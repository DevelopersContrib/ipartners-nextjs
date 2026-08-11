/** Client-safe match quiz intent — cookie + Discover/apply deep links. */

export const MATCH_COOKIE = "ipp_match";

export type MatchIntent = {
  mode: string;
  verticals: string[];
  commitment?: string;
  primaryVertical?: string;
  savedAt: number;
};

export function encodeMatchIntent(intent: Omit<MatchIntent, "savedAt">): string {
  const payload: MatchIntent = {
    ...intent,
    primaryVertical: intent.verticals[0],
    savedAt: Date.now(),
  };
  return encodeURIComponent(JSON.stringify(payload));
}

export function parseMatchIntent(raw: string | undefined | null): MatchIntent | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const data = JSON.parse(decoded) as MatchIntent;
    if (!data?.mode || typeof data.mode !== "string") return null;
    if (!Array.isArray(data.verticals)) data.verticals = [];
    return data;
  } catch {
    return null;
  }
}

export function matchDiscoverHref(intent: MatchIntent): string {
  const sp = new URLSearchParams();
  if (intent.mode) sp.set("mode", intent.mode);
  const v = intent.primaryVertical || intent.verticals[0];
  if (v) sp.set("vertical", v);
  const q = sp.toString();
  return q ? `/portal/discover?${q}` : "/portal/discover";
}

export function matchApplyHref(intent: MatchIntent): string {
  const sp = new URLSearchParams({ mode: intent.mode });
  const v = intent.primaryVertical || intent.verticals[0];
  if (v) sp.set("vertical", v);
  return `/apply?${sp.toString()}`;
}

export function readMatchIntentFromDocument(): MatchIntent | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${MATCH_COOKIE}=`));
  if (!row) return null;
  return parseMatchIntent(row.slice(MATCH_COOKIE.length + 1));
}

export function writeMatchIntentCookie(intent: Omit<MatchIntent, "savedAt">): void {
  if (typeof document === "undefined") return;
  const value = encodeMatchIntent(intent);
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${MATCH_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}
