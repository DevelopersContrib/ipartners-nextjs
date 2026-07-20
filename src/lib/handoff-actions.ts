"use server";

import { redirect } from "next/navigation";
import { redeemHandoff } from "./handoff";
import { createSession } from "./auth";

/**
 * Redeem a DD hand-off token and start the session.
 * Only ever called from an explicit user click on /continue — never on page load.
 */
export async function acceptHandoff(_prev: unknown, formData: FormData) {
  const token = String(formData.get("token") || "");
  if (!token) return { ok: false as const, error: "Missing hand-off token." };

  const res = await redeemHandoff(token);
  if (!res.ok) {
    const message =
      res.reason === "expired"
        ? "That link has expired. Sign in with your email instead — it only takes a moment."
        : res.reason === "already_used"
          ? "That link was already used. Sign in with your email to continue."
          : "We couldn't verify that link. Sign in with your email to continue.";
    return { ok: false as const, error: message };
  }

  await createSession(res.payload.email);

  // Land them on the application for the domain/type DD qualified them for.
  const p = new URLSearchParams();
  if (res.payload.domain) p.set("domain", res.payload.domain);
  if (res.payload.type) p.set("type", res.payload.type);
  const qs = p.toString();
  redirect(qs ? `/apply?${qs}` : "/portal");
}
