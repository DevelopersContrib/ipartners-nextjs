"use server";

import { redirect } from "next/navigation";
import { randomInt } from "crypto";
import { prisma } from "./db";
import { createSession, destroySession, randomToken } from "./auth";
import { sendEmail } from "./ses";

function safeNext(raw: unknown): string {
  const n = String(raw || "/portal");
  return n.startsWith("/") ? n : "/portal";
}

// Step 1 — email → send a 6-digit code.
export async function requestAuthCode(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const next = safeNext(formData.get("next"));

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  // Rate limit: 5 requests per email per 15 minutes.
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await prisma.ippAuthCode.count({ where: { email, createdAt: { gt: since } } });
  if (recent >= 5) {
    return { ok: false as const, error: "Too many requests. Wait a few minutes and try again." };
  }

  // Invalidate outstanding codes for this email.
  await prisma.ippAuthCode.updateMany({ where: { email, consumed: false }, data: { consumed: true } });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.ippAuthCode.create({ data: { token: randomToken(), email, code, next, expiresAt } });

  const { sent } = await sendEmail({
    to: email,
    subject: `${code} is your iPartners sign-in code`,
    html: codeEmail(code),
  });

  // In dev (no SES creds) surface the code so sign-in still works locally.
  const devCode = !sent && process.env.NODE_ENV !== "production" ? code : undefined;
  if (!sent && !devCode) {
    return { ok: false as const, error: "We couldn't send your code. Please try again." };
  }
  return { ok: true as const, email, next, devCode };
}

// Step 2 — email + code → session.
export async function verifyAuthCode(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const code = String(formData.get("code") || "").replace(/\D/g, "").slice(0, 6);
  const next = safeNext(formData.get("next"));

  if (code.length !== 6) {
    return { ok: false as const, email, next, error: "Enter the 6-digit code." };
  }

  const record = await prisma.ippAuthCode.findFirst({
    where: { email, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const, email, next, error: "That code is invalid or expired." };
  }
  if (record.attempts >= 5) {
    await prisma.ippAuthCode.update({ where: { token: record.token }, data: { consumed: true } });
    return { ok: false as const, email, next, error: "Too many attempts. Request a new code." };
  }
  if (record.code !== code) {
    const attempts = record.attempts + 1;
    await prisma.ippAuthCode.update({
      where: { token: record.token },
      data: { attempts, consumed: attempts >= 5 },
    });
    return { ok: false as const, email, next, error: "That code is incorrect." };
  }

  await prisma.ippAuthCode.update({ where: { token: record.token }, data: { consumed: true } });
  await createSession(email);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/** On-brand sign-in email (dark iPartners palette). */
function codeEmail(code: string): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0A0F0D;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#111916;border:1px solid #1E2D25;border-radius:16px;overflow:hidden">
      <div style="padding:28px 28px 8px">
        <h1 style="color:#fff;font-size:20px;margin:0 0 6px">Your sign-in code</h1>
        <p style="color:#8B9E93;font-size:14px;margin:0">Enter this code to access your iPartners account. It expires in 10 minutes.</p>
      </div>
      <div style="padding:16px 28px 28px">
        <div style="background:#0A0F0D;border:1px solid #2A3D32;border-radius:12px;padding:18px;text-align:center;
             font-size:34px;font-weight:700;letter-spacing:12px;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
          ${code}
        </div>
        <p style="color:#5A6E62;font-size:12px;margin:16px 0 0">
          If you didn't request this, you can safely ignore it — no one can access your account without this code.
        </p>
      </div>
    </div>
    <p style="color:#5A6E62;font-size:11px;text-align:center;margin:16px 0 0">iPartners — a VNOC venture</p>
  </div>`;
}
