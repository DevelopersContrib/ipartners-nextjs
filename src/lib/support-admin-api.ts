import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

/** API guard for /api/admin/support/* and /api/admin/emails-ai/* */
export async function supportAdminApiGuard() {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function requireSupportAdmin() {
  const admin = await getAdmin();
  if (!admin) return null;
  return admin;
}
