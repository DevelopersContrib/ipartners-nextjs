import { chatJSON, hasOpenAI } from "@/lib/openai";

export type SupportAiAction = "resolve" | "clarify" | "escalate";

export type SupportAiDecision = {
  action: SupportAiAction;
  reply: string;
  internal_note?: string;
  confidence: number;
};

const KNOWLEDGE_PACK = `
iPartner (ipartners.com / ipartner.com) connects partners with brand sponsorship and partnership opportunities across the Contrib / VNOC network.

App map:
- / — public marketing site
- /portal — partner portal (applications, opportunities, profile)
- /admin — staff admin (partnership Engagements triage — different from Emails & AI drip)
- /contact — contact / support tickets
- /apply, /match — partnership application flows
- Login is passwordless email code (no passwords)

Common topics:
- How to apply for a partnership / sponsorship
- Status of an application (pending / approved / active)
- Portal sign-in codes not arriving (check spam; SES from address)
- Updating company / domain profile
- Referral program page may embed a Referrals.com campaign widget
- Human partnership reviews happen in Admin → Engagements

Escalate (never auto-resolve):
- Legal, abuse, account deletion
- Payment / commission disputes needing finance
- Suspected platform bugs with no workaround
- Requests that need a specific account manager
`.trim();

export async function runSupportAiAgent(input: {
  subject: string;
  category: string;
  priority: string;
  source?: string;
  messages: { author_type: string; body: string }[];
  member: {
    plan_id: number | null;
    plan_expiry: Date | null;
  } | null;
}): Promise<SupportAiDecision> {
  if (!hasOpenAI()) {
    return {
      action: "escalate",
      reply: "Thanks — I'm connecting you with our support team.",
      internal_note: "OPENAI_API_KEY not set",
      confidence: 0,
    };
  }

  const thread = input.messages
    .map((m) => `${m.author_type}: ${m.body}`)
    .join("\n\n")
    .slice(0, 6000);

  const parsed = await chatJSON<Partial<SupportAiDecision>>({
    model:
      process.env.OPENAI_SUPPORT_MODEL?.trim() ||
      process.env.OPENAI_HELP_MODEL?.trim() ||
      "gpt-4o-mini",
    temperature: 0.25,
    json: true,
    system: `You are the iPartner Support Assistant.
Use ONLY the knowledge pack. Return JSON: { "action": "resolve"|"clarify"|"escalate", "reply": string, "internal_note"?: string, "confidence": number 0-1 }.
- resolve: clear how-to (confidence >= 0.75), numbered steps when helpful
- clarify: one focused question
- escalate: billing/legal/bugs/low confidence
Public reply: concise, friendly. Do not invent product features.

${KNOWLEDGE_PACK}`,
    prompt: `Category: ${input.category}
Priority: ${input.priority}
Subject: ${input.subject}
Source: ${input.source || "contact_form"}
Member id known: ${input.member ? "yes" : "guest"}

Thread:
${thread}`,
  });

  const action: SupportAiAction =
    parsed.action === "resolve" || parsed.action === "clarify" || parsed.action === "escalate"
      ? parsed.action
      : "escalate";
  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0;

  if (input.category === "billing") {
    return {
      action: "escalate",
      reply:
        parsed.reply?.trim() ||
        "I'll have our team review this billing question and follow up by email.",
      internal_note: parsed.internal_note || "billing category",
      confidence: 0,
    };
  }

  return {
    action,
    reply: (parsed.reply || "").trim() || "Thanks for reaching out.",
    internal_note: parsed.internal_note,
    confidence,
  };
}

export async function draftStaffSupportReply(input: {
  subject: string;
  publicId: string;
  status: string;
  staffHint?: string;
  messages: { author_type: string; body: string; is_internal?: boolean }[];
  requesterName: string | null;
}): Promise<{ draft: string; tips: string[] }> {
  if (!hasOpenAI()) {
    return { draft: "", tips: ["OPENAI_API_KEY is not set — write the reply manually."] };
  }

  const firstName = (input.requesterName || "").trim().split(/\s+/)[0] || "there";
  const publicThread = input.messages
    .filter((m) => !m.is_internal)
    .map((m) => `${m.author_type}: ${m.body}`)
    .join("\n\n")
    .slice(0, 7000);

  const parsed = await chatJSON<{ draft?: string; tips?: unknown }>({
    model:
      process.env.OPENAI_SUPPORT_MODEL?.trim() ||
      process.env.OPENAI_HELP_MODEL?.trim() ||
      "gpt-4o-mini",
    temperature: 0.45,
    json: true,
    system: `Draft a public support reply for iPartner staff. First person, proactive, numbered steps when helpful.
Do NOT add signature — panel adds it.
Return JSON: { "draft": string, "tips": string[] }

${KNOWLEDGE_PACK}`,
    prompt: `Ticket: ${input.publicId}
Subject: ${input.subject}
Status: ${input.status}
Customer first name: ${firstName}
Staff hint: ${input.staffHint?.trim() || "(none)"}

Thread:
${publicThread}`,
  });

  const tips = Array.isArray(parsed.tips)
    ? parsed.tips.filter((t): t is string => typeof t === "string").slice(0, 6)
    : [];

  return { draft: (parsed.draft || "").trim(), tips };
}
