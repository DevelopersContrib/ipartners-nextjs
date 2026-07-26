import "server-only";
import { helpContextForQuery, localHelpAnswer } from "@/lib/help/search";

export type HelpChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const SYSTEM = `You are the iPartner Help Assistant for signed-in partners.
Answer clearly and concisely using ONLY the provided help context when possible.
If the context is incomplete, say what you know and suggest /portal/help articles or hello@ipartner.com.
Never invent admin powers, payment checkout, live messaging, or contracts that are not in context.
Prefer short paragraphs and bullet lists. When relevant, cite article slugs as /portal/help/<slug>.
You are not a lawyer or financial advisor.`;

export function isHelpAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function answerHelpQuestion(
  messages: HelpChatMessage[],
): Promise<{
  answer: string;
  mode: "openai" | "local";
  articleSlugs: string[];
}> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUser?.content?.trim() || "";
  if (!query) {
    return {
      answer: "Ask a question about the portal, applications, deals, or placements.",
      mode: "local",
      articleSlugs: [],
    };
  }

  const local = localHelpAnswer(query);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { answer: local.answer, mode: "local", articleSlugs: local.articleSlugs };
  }

  const context = helpContextForQuery(query, 5);
  const model = process.env.OPENAI_HELP_MODEL?.trim() || "gpt-4o-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "system",
            content: `Help knowledge base:\n\n${context}`,
          },
          ...messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[help/ai] OpenAI error", res.status, errText.slice(0, 300));
      return { answer: local.answer, mode: "local", articleSlugs: local.articleSlugs };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer =
      data.choices?.[0]?.message?.content?.trim() || local.answer;

    return { answer, mode: "openai", articleSlugs: local.articleSlugs };
  } catch (e) {
    console.error("[help/ai] request failed", e);
    return { answer: local.answer, mode: "local", articleSlugs: local.articleSlugs };
  }
}
