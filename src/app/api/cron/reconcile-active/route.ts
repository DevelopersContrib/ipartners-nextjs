import { NextRequest, NextResponse } from "next/server";
import { reconcileApprovedToActive } from "@/lib/reconcile-active";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Nightly (or on-demand) approved → active reconcile.
 * Auth: Authorization: Bearer $CRON_SECRET  (Vercel Cron)
 * Optional: ?dryRun=1&limit=100
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
  const dryRun =
    searchParams.get("dryRun") === "1" || searchParams.get("dry_run") === "1";
  const limitRaw = parseInt(searchParams.get("limit") || "500", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 500;

  try {
    const result = await reconcileApprovedToActive({ dryRun, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/reconcile-active]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "reconcile failed" },
      { status: 500 },
    );
  }
}
