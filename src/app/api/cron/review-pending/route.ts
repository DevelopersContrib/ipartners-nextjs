import { NextRequest, NextResponse } from "next/server";
import { reviewPendingEngagements } from "@/lib/engagement-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nightly AI pre-screen of the pending queue, so /admin already has a verdict
 * and a summary on each row when someone opens it. Never changes status.
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 * Optional: ?limit=40&force=1
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const limitRaw = parseInt(searchParams.get("limit") || "40", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 40;
  const force = searchParams.get("force") === "1";

  try {
    const result = await reviewPendingEngagements({ limit, force });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/review-pending]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "review sweep failed" },
      { status: 500 },
    );
  }
}
