import { NextResponse } from "next/server";
import { supportAdminApiGuard } from "@/lib/support-admin-api";
import { ensureCampaignsForAllSegments } from "@/lib/engagement-crud";

export async function POST() {
  const denied = await supportAdminApiGuard();
  if (denied) return denied;

  try {
    const result = await ensureCampaignsForAllSegments();
    return NextResponse.json({
      ok: true,
      detail: `Ensured campaigns (created/updated).`,
      result,
    });
  } catch (e) {
    console.error("[emails-ai/ensure]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ensure failed" },
      { status: 500 }
    );
  }
}
