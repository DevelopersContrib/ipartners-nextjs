import "server-only";
import { prisma } from "./db";
import { getApplicationDetail } from "./application-detail";
import { getPartnerProfile } from "./partner-profile";
import { getTrafficForDomains } from "./partner-traffic";
import { heuristicFraudSignal, shouldAutoDecline } from "./fraud-screen";
import { MODE_LABELS, type EngagementMode } from "./engagement-modes";

/**
 * AI pre-screen for the pending queue.
 *
 * The admin queue used to show only an email and a triage score, so every row
 * had to be opened before it could be decided. This does the reading once —
 * application answers, profile, member history, traffic — and stores a verdict
 * plus a plain-English summary so the queue itself is decidable.
 *
 * It never changes engagement status. A human still commits every decision.
 *
 * Reviews live in `ipp_agent_message` under the internal role below, which
 * avoids a migration on the shared contrib_rdb. That table is also the partner
 * chat log, so this role must stay out of anything partner-facing.
 */

/** Internal ops role in ipp_agent_message. Column is VARCHAR(16). */
export const REVIEW_ROLE = "reviewer";

export const REVIEW_VERDICTS = [
  "approve",
  "decline",
  "needs_info",
  "review",
] as const;

export type ReviewVerdict = (typeof REVIEW_VERDICTS)[number];

export type EngagementReview = {
  verdict: ReviewVerdict;
  /** 0–1. */
  confidence: number;
  /** One-line ops reason, shown on the queue row. */
  reason: string;
  /** 2–3 short bullets: who they are, what they want, what backs it up. */
  summary: string[];
  /** Short warnings, e.g. "no application answers on file". */
  flags: string[];
  layer: "heuristic" | "ai";
  model?: string;
  reviewedAt: string;
};

export const VERDICT_LABELS: Record<ReviewVerdict, string> = {
  approve: "Approve",
  decline: "Decline",
  needs_info: "Needs info",
  review: "Read it",
};

export function isReviewVerdict(v: string): v is ReviewVerdict {
  return (REVIEW_VERDICTS as readonly string[]).includes(v);
}

type ReviewableRow = {
  id: bigint;
  email: string;
  mode: string;
  scopeType: string;
  scopeValue: string | null;
  tier: string | null;
  memberId: bigint | null;
  createdAt: Date;
  sourceTable: string | null;
  sourceId: bigint | null;
  applicationJson: string | null;
};

/** Columns `reviewEngagement` needs — reuse so callers stay in sync. */
export const REVIEW_SELECT = {
  id: true,
  email: true,
  mode: true,
  scopeType: true,
  scopeValue: true,
  tier: true,
  memberId: true,
  createdAt: true,
  sourceTable: true,
  sourceId: true,
  applicationJson: true,
} as const;

function ageDaysOf(d: Date): number {
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000));
}

/** Schema wording models sometimes echo back instead of filling in. */
const PLACEHOLDER_TEXT = new Set([
  "short warning",
  "short phrase",
  "what they want",
  "who they are",
  "what backs it up",
  "one line",
  "none",
  "n/a",
]);

function clampBullets(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, 200))
    .filter((v) => v && !PLACEHOLDER_TEXT.has(v.toLowerCase()))
    .slice(0, max);
}

/** Everything a human would read before deciding, flattened for the model. */
async function buildReviewContext(row: ReviewableRow) {
  const [detail, profile, member, siblings, traffic] = await Promise.all([
    getApplicationDetail({
      email: row.email,
      sourceTable: row.sourceTable,
      sourceId: row.sourceId,
      applicationJson: row.applicationJson,
    }).catch(() => ({
      fields: [] as { label: string; value: string }[],
      title: "Application",
      source: "none" as const,
    })),
    getPartnerProfile(row.email).catch(() => null),
    prisma.members
      .findFirst({
        where: { EmailAddress: row.email },
        select: { MemberId: true, SignupDate: true, LastLogin: true },
      })
      .catch(() => null),
    prisma.ippEngagement
      .findMany({
        where: { email: row.email, id: { not: row.id } },
        select: { mode: true, status: true, scopeValue: true },
        orderBy: { id: "desc" },
        take: 8,
      })
      .catch(() => []),
    row.scopeValue?.includes(".")
      ? getTrafficForDomains([row.scopeValue]).catch(
          () => ({}) as Awaited<ReturnType<typeof getTrafficForDomains>>,
        )
      : Promise.resolve({} as Awaited<ReturnType<typeof getTrafficForDomains>>),
  ]);

  const answers = detail.fields
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n")
    .slice(0, 3500);

  const visitors30d = row.scopeValue
    ? (traffic[row.scopeValue.toLowerCase()]?.visitors30d ?? 0)
    : 0;

  const name = profile
    ? [profile.firstname, profile.lastname].filter(Boolean).join(" ")
    : "";

  return {
    answers,
    answerCount: detail.fields.length,
    answerSource: detail.source,
    name,
    company: profile?.company || "",
    phone: profile?.phone || "",
    profileSource: profile?.source || "none",
    member,
    siblings,
    visitors30d,
  };
}

type ReviewContext = Awaited<ReturnType<typeof buildReviewContext>>;

/** Deterministic identity line, so the queue reads well even if AI is down. */
function identityBullet(row: ReviewableRow, ctx: ReviewContext): string {
  const who = [ctx.name, ctx.company].filter(Boolean).join(" · ");
  const modeLabel =
    MODE_LABELS[row.mode as EngagementMode] || row.mode.replace(/_/g, " ");
  const wants = row.scopeValue
    ? `${modeLabel} for ${row.scopeValue}`
    : modeLabel;
  return who ? `${who} — wants ${wants}` : `Unknown identity — wants ${wants}`;
}

function contextFlags(row: ReviewableRow, ctx: ReviewContext): string[] {
  const flags: string[] = [];
  if (ctx.answerCount === 0) flags.push("no application answers on file");
  if (!ctx.name && !ctx.company) flags.push("no name or company anywhere");
  if (!ctx.member) flags.push("no Members record — new to the network");
  if (!row.scopeValue) flags.push("no domain or category chosen");
  if (row.mode === "sponsor" && !row.tier) flags.push("sponsor with no tier");
  if (ctx.siblings.some((s) => s.status === "declined")) {
    flags.push("previously declined under this email");
  }
  if (ageDaysOf(row.createdAt) > 30) {
    flags.push(`waiting ${ageDaysOf(row.createdAt)} days`);
  }
  return flags;
}

function parseReviewJson(
  raw: string,
  model: string,
): Omit<EngagementReview, "reviewedAt"> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(raw.slice(start, end + 1)) as {
      verdict?: string;
      confidence?: number;
      reason?: string;
      summary?: unknown;
      flags?: unknown;
    };
    if (!data.verdict || !isReviewVerdict(data.verdict)) return null;
    return {
      verdict: data.verdict,
      confidence: Math.min(1, Math.max(0, Number(data.confidence) || 0)),
      reason: (data.reason || "AI review").trim().slice(0, 240),
      summary: clampBullets(data.summary, 2),
      flags: clampBullets(data.flags, 4),
      layer: "ai",
      model,
    };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You screen partnership applications for iPartner and write the note a human reviewer reads before deciding.

iPartner engagement modes:
- domain_owner: owns a domain and wants it monetised on the network
- builder: wants to build a site or app on a network domain
- app: brings an existing app or product to the network
- operator: runs an existing property day to day
- vendor: sells a product or service to the network
- referrer: refers partners for a share
- sponsor: pays annually (bronze/silver/gold) to sponsor a category or a single domain

Return ONLY compact JSON with exactly these keys:
verdict, confidence, reason, summary, flags.

verdict: one of approve, decline, needs_info, review
- approve: real person or company, coherent answers, plausible fit for the mode. Sponsors who paid are approve.
- decline: spam, fraud, gibberish, throwaway inbox, or clearly not a partnership.
- needs_info: plausible but too thin to decide — say in reason exactly what to ask for.
- review: genuinely judgement-dependent; explain the tension in reason.

confidence: number 0-1.
reason: one line, max 20 words.
summary: exactly 2 strings. The reviewer already sees the applicant's name, company
and requested mode, so do NOT restate them. Bullet 1 = what they concretely want to
do. Bullet 2 = the evidence for or against it (traffic numbers, prior engagements,
company, or what is missing).
flags: real warnings a reviewer should notice, as short phrases. Use an empty array
when there are none. Never emit placeholder or example text.

Rules:
- Never invent facts. Only use what is given. If a field is missing, that is a flag, not a guess.
- Be concrete: name the domain, the traffic number, the prior status. Never write filler like "applicant seems interested".
- Prefer needs_info over decline when the application is merely thin.
- Thin answers alone are not grounds to decline.`;

function buildUserPrompt(row: ReviewableRow, ctx: ReviewContext): string {
  const modeLabel =
    MODE_LABELS[row.mode as EngagementMode] || row.mode.replace(/_/g, " ");
  const history = ctx.siblings.length
    ? ctx.siblings
        .map((s) => `${s.mode}${s.scopeValue ? ` (${s.scopeValue})` : ""}: ${s.status}`)
        .join("; ")
    : "(none)";

  return `Engagement #${row.id}
Mode: ${modeLabel}
Scope: ${row.scopeType} = ${row.scopeValue || "(none)"}
Tier: ${row.tier || "(none)"}
Waiting: ${ageDaysOf(row.createdAt)} days

Applicant
Email: ${row.email}
Name: ${ctx.name || "(unknown)"}
Company: ${ctx.company || "(unknown)"}
Phone: ${ctx.phone ? "on file" : "(none)"}
Profile source: ${ctx.profileSource}
Members record: ${
    ctx.member
      ? `#${ctx.member.MemberId}${
          ctx.member.SignupDate
            ? `, joined ${ctx.member.SignupDate.toISOString().slice(0, 10)}`
            : ""
        }`
      : "none"
  }
Other engagements under this email: ${history}
${
  row.scopeValue?.includes(".")
    ? `Live traffic on ${row.scopeValue}: ${ctx.visitors30d.toLocaleString("en-US")} visitors/30d`
    : ""
}

Application answers (${ctx.answerCount} fields, source ${ctx.answerSource})
${ctx.answers || "(nothing on file)"}`;
}

async function askOpenAi(
  row: ReviewableRow,
  ctx: ReviewContext,
): Promise<Omit<EngagementReview, "reviewedAt"> | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model =
    process.env.OPENAI_REVIEW_MODEL?.trim() ||
    process.env.OPENAI_AGENT_MODEL?.trim() ||
    "gpt-4o-mini";

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
        max_tokens: 420,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(row, ctx) },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[review] OpenAI error", res.status, errText.slice(0, 300));
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return parseReviewJson(data.choices?.[0]?.message?.content || "", model);
  } catch (err) {
    console.error("[review] request failed", err);
    return null;
  }
}

/**
 * Review one engagement. Junk is caught by free heuristics first so we don't
 * spend a token on a mailinator address. Falls back to a deterministic
 * "read it" note when OpenAI is unavailable, so the queue is never blank.
 */
export async function reviewEngagement(
  row: ReviewableRow,
): Promise<EngagementReview> {
  const reviewedAt = new Date().toISOString();
  const junk = heuristicFraudSignal({
    email: row.email,
    scopeValue: row.scopeValue,
  });
  if (junk && shouldAutoDecline(junk)) {
    return {
      verdict: "decline",
      confidence: junk.confidence,
      reason: junk.reason,
      summary: [`Junk signup: ${row.email}`],
      flags: ["caught by junk-email heuristics"],
      layer: "heuristic",
      reviewedAt,
    };
  }

  const ctx = await buildReviewContext(row);
  const identity = identityBullet(row, ctx);
  const flags = contextFlags(row, ctx);

  const ai = await askOpenAi(row, ctx);
  if (ai) {
    return {
      ...ai,
      // Always lead with the deterministic identity line; the model's own
      // bullets follow as supporting detail.
      summary: [identity, ...ai.summary.filter((s) => s !== identity)].slice(0, 3),
      flags: [...new Set([...flags, ...ai.flags])].slice(0, 5),
      reviewedAt,
    };
  }

  return {
    verdict: ctx.answerCount === 0 ? "needs_info" : "review",
    confidence: 0.3,
    reason:
      ctx.answerCount === 0
        ? "No application answers on file — ask what they want to do"
        : "Needs a human read (AI review unavailable)",
    summary: [identity],
    flags,
    layer: "heuristic",
    reviewedAt,
  };
}

function reviewToContent(review: EngagementReview): string {
  const lines = [
    `${VERDICT_LABELS[review.verdict]} (${Math.round(review.confidence * 100)}%) — ${review.reason}`,
    ...review.summary.map((s) => `• ${s}`),
  ];
  if (review.flags.length) lines.push(`Flags: ${review.flags.join("; ")}`);
  return lines.join("\n").slice(0, 8000);
}

export async function saveEngagementReview(
  engagementId: bigint,
  email: string,
  review: EngagementReview,
): Promise<void> {
  await prisma.ippAgentMessage.create({
    data: {
      engagementId,
      email,
      role: REVIEW_ROLE,
      content: reviewToContent(review),
      metaJson: JSON.stringify(review),
    },
  });
}

function parseStoredReview(metaJson: string | null): EngagementReview | null {
  if (!metaJson) return null;
  try {
    const data = JSON.parse(metaJson) as Partial<EngagementReview>;
    if (!data.verdict || !isReviewVerdict(data.verdict)) return null;
    return {
      verdict: data.verdict,
      confidence:
        typeof data.confidence === "number"
          ? Math.min(1, Math.max(0, data.confidence))
          : 0,
      reason: data.reason || "",
      summary: Array.isArray(data.summary) ? data.summary : [],
      flags: Array.isArray(data.flags) ? data.flags : [],
      layer: data.layer === "ai" ? "ai" : "heuristic",
      model: data.model,
      reviewedAt: data.reviewedAt || "",
    };
  } catch {
    return null;
  }
}

/**
 * Latest review per engagement, keyed by stringified id.
 * One query for the whole page — the queue renders stored output only.
 */
export async function getLatestReviews(
  engagementIds: bigint[],
): Promise<Map<string, EngagementReview>> {
  const out = new Map<string, EngagementReview>();
  if (engagementIds.length === 0) return out;

  const rows = await prisma.ippAgentMessage.findMany({
    where: { engagementId: { in: engagementIds }, role: REVIEW_ROLE },
    orderBy: { id: "desc" },
    select: { engagementId: true, metaJson: true },
  });

  for (const r of rows) {
    const key = String(r.engagementId);
    if (out.has(key)) continue; // desc order — first hit is newest
    const parsed = parseStoredReview(r.metaJson);
    if (parsed) out.set(key, parsed);
  }
  return out;
}

export type ReviewSweepResult = {
  scanned: number;
  reviewed: number;
  failed: number;
  byVerdict: Record<ReviewVerdict, number>;
};

/**
 * Pre-screen pending engagements that have no review yet.
 * Sequential on purpose — one OpenAI call at a time keeps us well clear of
 * rate limits and makes a partial run harmless (each review is saved as it
 * completes). Never changes status.
 */
export async function reviewPendingEngagements(opts?: {
  limit?: number;
  /** Re-review rows that already have a review. */
  force?: boolean;
}): Promise<ReviewSweepResult> {
  const limit = Math.min(Math.max(opts?.limit ?? 25, 1), 200);

  const pending = await prisma.ippEngagement.findMany({
    where: { status: "pending" },
    orderBy: { id: "desc" },
    take: 300,
    select: { ...REVIEW_SELECT, status: true, updatedAt: true },
  });

  // Screen in the same order the admin works the queue, so page 1 of /admin is
  // the part that gets screened first. Ranking only gives us an order — map back
  // to the full rows, since RankedTriageRow drops the application columns.
  const { rankEngagementsForTriage } = await import("./admin-triage");
  const order = await rankEngagementsForTriage(pending)
    .then((rows) => rows.map((r) => String(r.id)))
    .catch(() => pending.map((p) => String(p.id)));
  const byId = new Map(pending.map((p) => [String(p.id), p]));

  let candidates: ReviewableRow[] = order
    .map((id) => byId.get(id))
    .filter((row): row is (typeof pending)[number] => !!row);
  if (!opts?.force) {
    const existing = await getLatestReviews(pending.map((p) => p.id));
    candidates = candidates.filter((p) => !existing.has(String(p.id)));
  }
  candidates = candidates.slice(0, limit);

  const byVerdict: Record<ReviewVerdict, number> = {
    approve: 0,
    decline: 0,
    needs_info: 0,
    review: 0,
  };
  let reviewed = 0;
  let failed = 0;

  for (const row of candidates) {
    try {
      const review = await reviewEngagement(row);
      await saveEngagementReview(row.id, row.email, review);
      byVerdict[review.verdict] += 1;
      reviewed += 1;
    } catch (err) {
      failed += 1;
      console.error(`[review] engagement #${row.id} failed:`, err);
    }
  }

  console.log(
    `[review] swept ${reviewed}/${candidates.length} pending (approve=${byVerdict.approve} decline=${byVerdict.decline} needs_info=${byVerdict.needs_info} review=${byVerdict.review} failed=${failed})`,
  );

  return { scanned: candidates.length, reviewed, failed, byVerdict };
}

/** Re-review a single engagement on demand (admin detail page). */
export async function reviewOneEngagement(
  engagementId: bigint,
): Promise<EngagementReview | null> {
  const row = await prisma.ippEngagement.findUnique({
    where: { id: engagementId },
    select: REVIEW_SELECT,
  });
  if (!row) return null;
  const review = await reviewEngagement(row);
  await saveEngagementReview(row.id, row.email, review);
  return review;
}
