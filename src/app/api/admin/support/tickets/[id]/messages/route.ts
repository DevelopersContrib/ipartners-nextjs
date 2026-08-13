import { NextRequest, NextResponse } from "next/server";
import { requireSupportAdmin } from "@/lib/support-admin-api";
import { addStaffMessage, SupportTicketError } from "@/lib/support-tickets";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireSupportAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as {
    body?: string;
    isInternal?: boolean;
  };

  try {
    const ticket = await addStaffMessage({
      ticketId: id,
      adminId: admin.memberId ?? 0,
      body: body.body || "",
      isInternal: Boolean(body.isInternal),
      staffName:
        [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() ||
        admin.email,
    });
    return NextResponse.json({ ticket });
  } catch (e) {
    if (e instanceof SupportTicketError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
