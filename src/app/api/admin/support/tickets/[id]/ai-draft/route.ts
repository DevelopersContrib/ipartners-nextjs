import { NextRequest, NextResponse } from "next/server";
import { requireSupportAdmin } from "@/lib/support-admin-api";
import { getPanelTicket, SupportTicketError } from "@/lib/support-tickets";
import { draftStaffSupportReply } from "@/lib/support-ai-agent";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireSupportAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { hint?: string };

  try {
    const ticket = await getPanelTicket(id);
    const draft = await draftStaffSupportReply({
      subject: ticket.subject,
      publicId: ticket.public_id,
      status: ticket.status,
      staffHint: body.hint,
      messages: ticket.messages.map((m) => ({
        author_type: m.author_type,
        body: m.body,
        is_internal: m.is_internal,
      })),
      requesterName: ticket.requester_name,
    });
    return NextResponse.json(draft);
  } catch (e) {
    if (e instanceof SupportTicketError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
