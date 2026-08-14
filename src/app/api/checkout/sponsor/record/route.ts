import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/auth";
import { recordPaydirectPayment } from "@/lib/paydirect";
import { isSponsorTier } from "@/lib/admin-client";
import { sponsorTierAmount } from "@/lib/sponsor-pricing";

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

  const paymentId = String((body as { paymentId?: unknown }).paymentId || "").trim();
  const tier = String((body as { tier?: unknown }).tier || "")
    .trim()
    .toLowerCase();
  const vertical = String((body as { vertical?: unknown }).vertical || "").trim();
  const paymentMethod = String(
    (body as { paymentMethod?: unknown }).paymentMethod || "",
  ).trim();
  const status = String((body as { status?: unknown }).status || "created").trim();
  const engagementId = String(
    (body as { engagementId?: unknown }).engagementId || "",
  ).trim();

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }
  if (!isSponsorTier(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const amount =
    String((body as { amount?: unknown }).amount || "").trim() ||
    sponsorTierAmount(tier) ||
    "0";

  const row = await recordPaydirectPayment({
    providerPaymentId: paymentId,
    email: partner.email,
    amount,
    tier,
    vertical: vertical || null,
    paymentMethod: paymentMethod || null,
    status,
    engagementId: engagementId || null,
    metadata: {
      email: partner.email,
      tier,
      vertical,
      product: "ipartner_sponsor",
      ...(engagementId ? { engagement_id: engagementId } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    id: String(row.id),
    status: row.status,
  });
}
