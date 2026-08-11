import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/auth";
import {
  chatWithPendingPartner,
  listAgentMessages,
} from "@/lib/partner-agent";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const idRaw = url.searchParams.get("engagementId");
  if (!idRaw) {
    return NextResponse.json({ error: "engagementId required" }, { status: 400 });
  }

  let engagementId: bigint;
  try {
    engagementId = BigInt(idRaw);
  } catch {
    return NextResponse.json({ error: "Invalid engagementId" }, { status: 400 });
  }

  const messages = await listAgentMessages(engagementId, partner.email);
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: String(m.id),
      role: m.role,
      content: m.content,
      meta: m.metaJson,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

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

  const engagementIdRaw = (body as { engagementId?: unknown }).engagementId;
  const message = String((body as { message?: unknown }).message || "").trim();

  if (!engagementIdRaw || !message) {
    return NextResponse.json(
      { error: "engagementId and message required" },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  let engagementId: bigint;
  try {
    engagementId = BigInt(String(engagementIdRaw));
  } catch {
    return NextResponse.json({ error: "Invalid engagementId" }, { status: 400 });
  }

  const result = await chatWithPendingPartner({
    engagementId,
    email: partner.email,
    userMessage: message,
  });

  return NextResponse.json({
    answer: result.answer,
    recommendation: result.recommendation,
    approved: result.approved,
    growagentPushed: result.growagentPushed,
    mode: result.mode,
  });
}
