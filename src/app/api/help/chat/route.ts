import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/auth";
import { getHelpArticle } from "@/lib/help/articles";
import { answerHelpQuestion, type HelpChatMessage } from "@/lib/help/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messagesRaw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messagesRaw) || messagesRaw.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const messages: HelpChatMessage[] = [];
  for (const m of messagesRaw.slice(-10)) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim().length > 0 &&
      content.length < 4000
    ) {
      messages.push({ role, content: content.trim() });
    }
  }

  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from user" },
      { status: 400 },
    );
  }

  const result = await answerHelpQuestion(messages);
  const articles = result.articleSlugs
    .map((slug) => getHelpArticle(slug))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map((a) => ({ slug: a.slug, title: a.title }));

  return NextResponse.json({
    answer: result.answer,
    mode: result.mode,
    articles,
  });
}
