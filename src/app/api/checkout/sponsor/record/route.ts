import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordPaydirectPayment } from "@/lib/paydirect";
import { isSponsorTier } from "@/lib/admin-client";
import {
  isSponsorScope,
  normalizeSponsorDomain,
  sponsorTierAmount,
} from "@/lib/sponsor-pricing";
import { VERTICALS } from "@/lib/verticals";

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
  const engagementId = String(
    (body as { engagementId?: unknown }).engagementId || "",
  ).trim();
  const scopeTypeRaw = String((body as { scopeType?: unknown }).scopeType || "")
    .trim()
    .toLowerCase();
  const scopeValueRaw = String(
    (body as { scopeValue?: unknown }).scopeValue || "",
  ).trim();

  if (!/^[A-Za-z0-9_-]{1,191}$/.test(paymentId)) {
    return NextResponse.json({ error: "Invalid paymentId" }, { status: 400 });
  }
  if (!isSponsorTier(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (!VERTICALS.some((item) => item.slug === vertical)) {
    return NextResponse.json({ error: "Invalid vertical" }, { status: 400 });
  }
  if (!isSponsorScope(scopeTypeRaw)) {
    return NextResponse.json({ error: "Invalid sponsorship scope" }, { status: 400 });
  }

  // Domain scope needs a valid hostname; category scope uses the known vertical.
  const domainScope =
    scopeTypeRaw === "domain" ? normalizeSponsorDomain(scopeValueRaw) : "";
  if (scopeTypeRaw === "domain" && !domainScope) {
    return NextResponse.json({ error: "Invalid sponsor domain" }, { status: 400 });
  }
  const scopeType = scopeTypeRaw;
  const scopeValue = scopeType === "domain" ? domainScope : vertical;

  const amount = sponsorTierAmount(tier);
  if (!amount) {
    return NextResponse.json({ error: "Tier has no price" }, { status: 400 });
  }

  let trustedEngagementId: string | null = null;
  if (engagementId) {
    if (!/^\d+$/.test(engagementId)) {
      return NextResponse.json({ error: "Invalid engagement id" }, { status: 400 });
    }
    const engagement = await prisma.ippEngagement.findFirst({
      where: {
        id: BigInt(engagementId),
        email: partner.email,
        mode: "sponsor",
        status: { in: ["pending", "approved"] },
        scopeType,
        scopeValue,
      },
      select: { id: true },
    });
    if (!engagement) {
      return NextResponse.json(
        { error: "Sponsor engagement does not match this checkout" },
        { status: 400 },
      );
    }
    trustedEngagementId = String(engagement.id);
  }

  const row = await recordPaydirectPayment({
    providerPaymentId: paymentId,
    email: partner.email,
    amount,
    tier,
    vertical: vertical || null,
    paymentMethod: paymentMethod || null,
    status: "created",
    engagementId: trustedEngagementId,
    metadata: {
      email: partner.email,
      tier,
      vertical,
      scope_type: scopeType,
      scope_value: scopeValue,
      product: "ipartner_sponsor",
      ...(trustedEngagementId
        ? { engagement_id: trustedEngagementId }
        : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    id: String(row.id),
    status: row.status,
  });
}
