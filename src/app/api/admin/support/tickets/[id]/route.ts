import { NextRequest, NextResponse } from "next/server";
import { requireSupportAdmin } from "@/lib/support-admin-api";
import {
  getPanelTicket,
  updatePanelTicket,
  SupportTicketError,
} from "@/lib/support-tickets";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await requireSupportAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const ticket = await getPanelTicket(id);
    return NextResponse.json({ ticket });
  } catch (e) {
    if (e instanceof SupportTicketError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireSupportAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as {
    status?: string;
    priority?: string;
    assigned_admin_id?: number | null;
  };
  try {
    const ticket = await updatePanelTicket(id, body);
    return NextResponse.json({ ticket });
  } catch (e) {
    if (e instanceof SupportTicketError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
