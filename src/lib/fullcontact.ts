import "server-only";

/**
 * Thin FullContact Person Enrich client (same pattern as Growagent).
 * No-ops cleanly when FULLCONTACT_API_KEY is unset.
 */

export type FullContactEnrichment = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  fullName?: string | null;
  title?: string | null;
  organization?: string | null;
  location?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  bio?: string | null;
  rawSummary?: string;
};

type FcPerson = {
  fullName?: string;
  title?: string;
  organization?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
  bio?: string;
  details?: {
    profiles?: Record<string, { url?: string; username?: string }>;
    employment?: { title?: string; name?: string }[];
    locations?: { city?: string; region?: string; country?: string }[];
  };
};

export function isFullContactConfigured(): boolean {
  return Boolean(process.env.FULLCONTACT_API_KEY?.trim());
}

export async function enrichEmailWithFullContact(
  email: string,
): Promise<FullContactEnrichment> {
  const key = process.env.FULLCONTACT_API_KEY?.trim();
  if (!key) {
    return { ok: true, skipped: true, reason: "FULLCONTACT_API_KEY not set" };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { ok: false, reason: "Invalid email" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.fullcontact.com/v3/person.enrich", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalized }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.status === 404) {
      return { ok: true, reason: "No FullContact match" };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[fullcontact]", res.status, text.slice(0, 200));
      return { ok: false, reason: `FullContact HTTP ${res.status}` };
    }

    const data = (await res.json()) as FcPerson;
    const profiles = data.details?.profiles || {};
    const linkedin =
      data.linkedin ||
      profiles.linkedin?.url ||
      (profiles.linkedin?.username
        ? `https://www.linkedin.com/in/${profiles.linkedin.username}`
        : null);
    const twitter =
      data.twitter ||
      profiles.twitter?.url ||
      (profiles.twitter?.username
        ? `https://twitter.com/${profiles.twitter.username}`
        : null);
    const emp = data.details?.employment?.[0];
    const loc = data.details?.locations?.[0];
    const location =
      data.location ||
      (loc
        ? [loc.city, loc.region, loc.country].filter(Boolean).join(", ")
        : null);

    return {
      ok: true,
      fullName: data.fullName || null,
      title: data.title || emp?.title || null,
      organization: data.organization || emp?.name || null,
      location,
      linkedin,
      twitter,
      bio: data.bio || null,
      rawSummary: [
        data.fullName,
        data.title || emp?.title,
        data.organization || emp?.name,
        location,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  } catch (err) {
    console.error("[fullcontact]", err);
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "FullContact request failed",
    };
  }
}
