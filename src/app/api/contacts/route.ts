import { NextRequest, NextResponse } from "next/server";
import { createContactFormTicket } from "@/lib/support-email-tickets";
import { getCurrentPartner } from "@/lib/auth";

export const runtime = "nodejs";

/** POST /api/contacts — public contact form → support ticket + autoresponder + AI */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      email?: string;
      message?: string;
    } | null;

    let name = (body?.name || "").trim();
    let email = (body?.email || "").trim();
    const message = (body?.message || "").trim();

    const partner = await getCurrentPartner();
    if (partner) {
      email = email || partner.email;
      name =
        name ||
        [partner.firstName, partner.lastName].filter(Boolean).join(" ").trim() ||
        partner.company ||
        "";
    }

    if (!email || !message || message.length < 5) {
      return NextResponse.json(
        { error: "Email and message (min 5 chars) are required" },
        { status: 400 }
      );
    }

    const ticket = await createContactFormTicket({
      name: name || "there",
      email,
      message,
    });

    return NextResponse.json({
      ok: true,
      publicId: ticket.publicId,
      ticketId: ticket.ticketId,
    });
  } catch (e) {
    console.error("[api/contacts]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create ticket" },
      { status: 500 }
    );
  }
}
