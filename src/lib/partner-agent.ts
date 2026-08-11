import "server-only";
import { prisma } from "./db";
import { getApplicationDetail } from "./application-detail";
import { MODE_LABELS, type EngagementMode } from "./engagement-modes";
import { pushEngagementToGrowagent } from "./growagent";
import { notifyStatusChange } from "./campaigns";

export type AgentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentRecommendation = {
  action: "approve" | "decline" | "continue";
  confidence: number;
  reason: string;
};

export type PartnerAgentResult = {
  answer: string;
  recommendation: AgentRecommendation | null;
  approved: boolean;
  growagentPushed: boolean;
  mode: "openai" | "local";
};

function agentAutoApproveEnabled(): boolean {
  const flag = (process.env.AGENT_AUTO_APPROVE || "false").trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "on";
}

function parseRecommendation(raw: string): {
  answer: string;
  recommendation: AgentRecommendation | null;
} {
  const fence = raw.match(/```json\s*([\s\S]*?)```/i);
  const jsonBlob = fence?.[1] || raw.match(/\{[\s\S]*"action"\s*:\s*"(approve|decline|continue)"[\s\S]*\}/)?.[0];

  let recommendation: AgentRecommendation | null = null;
  let answer = raw;

  if (jsonBlob) {
    try {
      const data = JSON.parse(jsonBlob) as {
        action?: string;
        confidence?: number;
        reason?: string;
        message?: string;
      };
      if (
        data.action === "approve" ||
        data.action === "decline" ||
        data.action === "continue"
      ) {
        recommendation = {
          action: data.action,
          confidence: Math.min(1, Math.max(0, Number(data.confidence) || 0)),
          reason: (data.reason || "").slice(0, 400),
        };
      }
      if (typeof data.message === "string" && data.message.trim()) {
        answer = data.message.trim();
      } else {
        answer = raw.replace(fence?.[0] || jsonBlob, "").trim() || raw;
      }
    } catch {
      /* keep raw */
    }
  }

  return { answer, recommendation };
}

async function buildEngagementContext(engagementId: bigint, email: string) {
  const e = await prisma.ippEngagement.findFirst({
    where: { id: engagementId, email },
  });
  if (!e) return null;

  const detail = await getApplicationDetail({
    email: e.email,
    sourceTable: e.sourceTable,
    sourceId: e.sourceId,
    applicationJson: e.applicationJson,
  }).catch(() => ({
    fields: [] as { label: string; value: string }[],
    title: "Application",
    source: "none" as const,
  }));

  const answers = detail.fields
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n")
    .slice(0, 3500);

  return { engagement: e, answers };
}

/**
 * Converse with a pending partner about their application.
 * May recommend approve/decline; auto-approves only when AGENT_AUTO_APPROVE=true
 * and confidence ≥ 0.9 — then pushes Growagent.
 */
export async function chatWithPendingPartner(opts: {
  engagementId: bigint;
  email: string;
  userMessage: string;
}): Promise<PartnerAgentResult> {
  const ctx = await buildEngagementContext(opts.engagementId, opts.email);
  if (!ctx) {
    return {
      answer: "I couldn't find that application.",
      recommendation: null,
      approved: false,
      growagentPushed: false,
      mode: "local",
    };
  }

  const { engagement: e, answers } = ctx;
  if (e.status !== "pending") {
    return {
      answer: `This application is already marked ${e.status}. Open Deals for status details, or email hello@ipartner.com.`,
      recommendation: null,
      approved: false,
      growagentPushed: false,
      mode: "local",
    };
  }

  await prisma.ippAgentMessage.create({
    data: {
      engagementId: e.id,
      email: e.email,
      role: "user",
      content: opts.userMessage.slice(0, 4000),
    },
  });

  const history = await prisma.ippAgentMessage.findMany({
    where: { engagementId: e.id },
    orderBy: { id: "asc" },
    take: 24,
    select: { role: true, content: true },
  });

  const modeLabel =
    MODE_LABELS[e.mode as EngagementMode] || e.mode.replace(/_/g, " ");
  const system = `You are the iPartner Partner Agent. You help pending applicants clarify their partnership application and readiness.
Engagement #${e.id}: mode=${modeLabel}, scope=${e.scopeValue || "(none)"}, tier=${e.tier || "(none)"}, status=pending.
Application answers:
${answers || "(none on file)"}

Goals:
1) Ask short, useful questions (experience, what they'll deliver, domain ownership, timeline).
2) Be warm and concise. Never invent checkout, contracts, or live messaging beyond this chat.
3) When you have enough signal, end with a JSON block (and a partner-facing message):
\`\`\`json
{"action":"approve"|"decline"|"continue","confidence":0-1,"reason":"short ops reason","message":"what the partner sees"}
\`\`\`
Use action=approve only for clear, serious partners (real email, coherent answers, fit for the mode). Prefer continue when unsure. Use decline only for spam/fraud/clear mismatch.
Do not tell the partner you approved them unless action is approve — approval may still need a human.`;

  const key = process.env.OPENAI_API_KEY?.trim();
  let answer =
    "Thanks for the update. Our team will review your answers shortly. You can also email hello@ipartner.com.";
  let recommendation: AgentRecommendation | null = null;
  let mode: "openai" | "local" = "local";

  if (key) {
    const model =
      process.env.OPENAI_AGENT_MODEL?.trim() ||
      process.env.OPENAI_HELP_MODEL?.trim() ||
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
          temperature: 0.4,
          max_tokens: 700,
          messages: [
            { role: "system", content: system },
            ...history
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const raw = data.choices?.[0]?.message?.content?.trim() || "";
        const parsed = parseRecommendation(raw);
        answer = parsed.answer;
        recommendation = parsed.recommendation;
        mode = "openai";
      } else {
        const errText = await res.text().catch(() => "");
        console.error("[partner-agent] OpenAI error", res.status, errText.slice(0, 300));
      }
    } catch (err) {
      console.error("[partner-agent] request failed", err);
    }
  }

  await prisma.ippAgentMessage.create({
    data: {
      engagementId: e.id,
      email: e.email,
      role: "assistant",
      content: answer.slice(0, 8000),
      metaJson: recommendation ? JSON.stringify(recommendation) : null,
    },
  });

  let approved = false;
  let growagentPushed = false;

  if (
    recommendation?.action === "approve" &&
    recommendation.confidence >= 0.9 &&
    agentAutoApproveEnabled()
  ) {
    const previousById = new Map([[String(e.id), e.status]]);
    await prisma.ippEngagement.update({
      where: { id: e.id },
      data: { status: "approved" },
    });
    approved = true;
    console.log(
      `[partner-agent] auto-approved #${e.id} (${e.email}): ${recommendation.reason}`,
    );
    void notifyStatusChange([e.id], "approved", previousById).catch((err) =>
      console.error("[partner-agent] campaign notify failed:", err),
    );

    const push = await pushEngagementToGrowagent({
      email: e.email,
      engagementId: e.id,
      mode: e.mode,
      scopeValue: e.scopeValue,
      status: "approved",
      tier: e.tier,
    });
    growagentPushed = push.ok && !push.skipped;

    answer = `${answer}\n\nYou're approved — next we'll nurture next steps and publish when ready. Check Deals anytime.`;
  }

  return {
    answer,
    recommendation,
    approved,
    growagentPushed,
    mode,
  };
}

export async function listAgentMessages(engagementId: bigint, email: string) {
  const e = await prisma.ippEngagement.findFirst({
    where: { id: engagementId, email },
    select: { id: true },
  });
  if (!e) return [];
  return prisma.ippAgentMessage.findMany({
    where: { engagementId },
    orderBy: { id: "asc" },
    take: 50,
    select: {
      id: true,
      role: true,
      content: true,
      metaJson: true,
      createdAt: true,
    },
  });
}
