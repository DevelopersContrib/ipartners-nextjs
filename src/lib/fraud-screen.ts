import "server-only";

/**
 * Fraud / junk screening for partnership applications.
 * Layer 1: deterministic disposable/junk email heuristics (no API).
 * Layer 2: OpenAI review of application text (high-confidence decline only).
 */

export type FraudVerdict = "decline" | "keep" | "review";

export type FraudSignal = {
  verdict: FraudVerdict;
  confidence: number;
  reason: string;
  layer: "heuristic" | "ai" | "none";
};

/** Common throwaway / temporary inbox providers. */
const DISPOSABLE_DOMAINS = new Set(
  [
    "mailinator.com",
    "mailinator.net",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "sharklasers.com",
    "grr.la",
    "guerrillamailblock.com",
    "pokemail.net",
    "spam4.me",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "tmpmail.org",
    "tmpmail.net",
    "10minutemail.com",
    "10minutemail.net",
    "throwaway.email",
    "yopmail.com",
    "yopmail.fr",
    "trashmail.com",
    "trashmail.me",
    "discard.email",
    "discardmail.com",
    "mailnesia.com",
    "maildrop.cc",
    "getnada.com",
    "nada.email",
    "emailondeck.com",
    "fakeinbox.com",
    "mailnull.com",
    "spamgourmet.com",
    "mintemail.com",
    "mytemp.email",
    "tempail.com",
    "tempr.email",
    "moakt.com",
    "mohmal.com",
    "inboxkitten.com",
    "mailcatch.com",
    "mailinator.org",
    "guerrillamail.biz",
    "spam.la",
    "trash-mail.com",
    "wegwerfmail.de",
    "wegwerfmail.net",
    "jetable.org",
    "mailforspam.com",
    "dispostable.com",
    "tempinbox.com",
    "burnermail.io",
    "simplelogin.co", // often aliases — treat carefully; keep as review not auto
  ].filter((d) => d !== "simplelogin.co"),
);

const JUNK_LOCAL_PATTERNS = [
  /^test(\d+)?$/i,
  /^asdf/i,
  /^qwerty/i,
  /^noreply$/i,
  /^no-?reply$/i,
  /^spam$/i,
  /^fake$/i,
  /^xxx+$/i,
];

function emailParts(email: string): { local: string; domain: string } | null {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return null;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1).replace(/^www\./, "");
  if (!domain.includes(".")) return null;
  return { local, domain };
}

export function isDisposableEmailDomain(email: string): boolean {
  const parts = emailParts(email);
  if (!parts) return false;
  if (DISPOSABLE_DOMAINS.has(parts.domain)) return true;
  // subdomain of a known disposable root (e.g. foo.mailinator.com)
  for (const d of DISPOSABLE_DOMAINS) {
    if (parts.domain.endsWith(`.${d}`)) return true;
  }
  return false;
}

/** Obvious non-partner junk without needing AI. */
export function heuristicFraudSignal(input: {
  email: string;
  scopeValue?: string | null;
  applicationText?: string | null;
}): FraudSignal | null {
  const email = input.email.trim().toLowerCase();
  const parts = emailParts(email);

  if (!parts) {
    return {
      verdict: "decline",
      confidence: 1,
      reason: "Invalid email address",
      layer: "heuristic",
    };
  }

  if (
    parts.domain === "localhost" ||
    parts.domain.endsWith(".localhost") ||
    parts.domain === "example.com" ||
    parts.domain === "example.org" ||
    parts.domain === "test.com" ||
    parts.domain.includes("localhost")
  ) {
    return {
      verdict: "decline",
      confidence: 1,
      reason: `Junk / non-deliverable domain (${parts.domain})`,
      layer: "heuristic",
    };
  }

  if (isDisposableEmailDomain(email)) {
    return {
      verdict: "decline",
      confidence: 1,
      reason: `Disposable / throwaway email domain (${parts.domain})`,
      layer: "heuristic",
    };
  }

  if (JUNK_LOCAL_PATTERNS.some((re) => re.test(parts.local))) {
    return {
      verdict: "decline",
      confidence: 0.95,
      reason: `Junk-looking local part (${parts.local}@…)`,
      layer: "heuristic",
    };
  }

  const scope = (input.scopeValue || "").toLowerCase();
  if (
    scope.includes("localhost") ||
    scope === "example.com" ||
    scope.startsWith("http://") ||
    scope.startsWith("https://")
  ) {
    return {
      verdict: "decline",
      confidence: 0.9,
      reason: `Junk / invalid scope (${input.scopeValue})`,
      layer: "heuristic",
    };
  }

  const text = (input.applicationText || "").toLowerCase();
  if (text.length > 40) {
    const spamHits = [
      "crypto airdrop",
      "guaranteed roi",
      "nigerian",
      "wire transfer",
      "act now!!!",
      "seo backlink package",
      "buy followers",
      "casino bonus",
      "viagra",
      "click here to claim",
    ].filter((p) => text.includes(p));
    if (spamHits.length >= 2) {
      return {
        verdict: "decline",
        confidence: 0.92,
        reason: `Spam phrases in application (${spamHits.slice(0, 2).join(", ")})`,
        layer: "heuristic",
      };
    }
  }

  return null;
}

export function isFraudAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function parseAiJson(raw: string): FraudSignal | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(trimmed.slice(start, end + 1)) as {
      verdict?: string;
      confidence?: number;
      reason?: string;
    };
    const verdict = data.verdict;
    if (verdict !== "decline" && verdict !== "keep" && verdict !== "review") {
      return null;
    }
    const confidence = Math.min(
      1,
      Math.max(0, Number(data.confidence) || 0),
    );
    return {
      verdict,
      confidence,
      reason: (data.reason || "AI review").slice(0, 280),
      layer: "ai",
    };
  } catch {
    return null;
  }
}

/**
 * Ask OpenAI whether this pending application looks fraudulent / spam.
 * Returns null when AI is unavailable or the call fails (caller should keep).
 */
export async function aiFraudSignal(input: {
  email: string;
  mode: string;
  scopeValue?: string | null;
  tier?: string | null;
  applicationText?: string | null;
}): Promise<FraudSignal | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model =
    process.env.OPENAI_FRAUD_MODEL?.trim() ||
    process.env.OPENAI_HELP_MODEL?.trim() ||
    "gpt-4o-mini";

  const system = `You screen iPartner partnership applications for fraud, spam, and throwaway abuse.
Return ONLY compact JSON: {"verdict":"decline"|"keep"|"review","confidence":0-1,"reason":"short"}
Decline ONLY when clearly fraudulent, disposable-inbox abuse, gibberish, SEO spam, scam pitches, or empty/fake identity.
Keep legitimate builders, domain owners, agencies, and sponsors even if the application is thin.
Use "review" when unsure. Never invent facts. Prefer keep over decline when ambiguous.`;

  const user = `Email: ${input.email}
Mode: ${input.mode}
Scope: ${input.scopeValue || "(none)"}
Tier: ${input.tier || "(none)"}
Application answers:
${(input.applicationText || "(no answers on file)").slice(0, 3500)}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 180,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[fraud] OpenAI error", res.status, errText.slice(0, 300));
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content || "";
    return parseAiJson(content);
  } catch (err) {
    console.error("[fraud] AI request failed", err);
    return null;
  }
}

/** Min confidence for AI (not heuristic) auto-decline. */
export const AI_AUTO_DECLINE_MIN_CONFIDENCE = 0.85;

export function shouldAutoDecline(signal: FraudSignal): boolean {
  if (signal.verdict !== "decline") return false;
  if (signal.layer === "heuristic") return signal.confidence >= 0.9;
  return signal.confidence >= AI_AUTO_DECLINE_MIN_CONFIDENCE;
}

export type ScreenFraudResult = {
  signal: FraudSignal;
  autoDecline: boolean;
};

/**
 * Full screen: heuristics first, then AI only when heuristics did not decide.
 */
export async function screenEngagementForFraud(input: {
  email: string;
  mode: string;
  scopeValue?: string | null;
  tier?: string | null;
  applicationText?: string | null;
  useAi?: boolean;
}): Promise<ScreenFraudResult> {
  const heuristic = heuristicFraudSignal({
    email: input.email,
    scopeValue: input.scopeValue,
    applicationText: input.applicationText,
  });
  if (heuristic && shouldAutoDecline(heuristic)) {
    return { signal: heuristic, autoDecline: true };
  }

  if (input.useAi !== false) {
    const ai = await aiFraudSignal(input);
    if (ai) {
      return { signal: ai, autoDecline: shouldAutoDecline(ai) };
    }
  }

  if (heuristic) {
    return { signal: heuristic, autoDecline: shouldAutoDecline(heuristic) };
  }

  return {
    signal: {
      verdict: "keep",
      confidence: 0.5,
      reason: "No fraud signals",
      layer: "none",
    },
    autoDecline: false,
  };
}
