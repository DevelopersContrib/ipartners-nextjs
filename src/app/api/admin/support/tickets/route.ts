import { NextResponse } from "next/server";
import { supportAdminApiGuard } from "@/lib/support-admin-api";
import { listPanelTickets } from "@/lib/support-tickets";

export async function GET(req: Request) {
  const denied = await supportAdminApiGuard();
  if (denied) return denied;

  const sp = new URL(req.url).searchParams;
  const tickets = await listPanelTickets({
    status: sp.get("status") || undefined,
    source: sp.get("source") || undefined,
    q: sp.get("q") || undefined,
  });
  return NextResponse.json({ tickets });
}
