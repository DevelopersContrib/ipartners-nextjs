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

async function finishIssue(opts: {
  email: string;
  next: string;
  code: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subject: string;
  html: string;
}) {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await prisma.ippAuthCode.count({
    where: { email: opts.email, createdAt: { gt: since } },
  });
  if (recent >= 5) {
    return { ok: false as const, error: "Too many requests. Wait a few minutes and try again." };
  }

  await prisma.ippAuthCode.updateMany({
    where: { email: opts.email, consumed: false },
    data: { consumed: true },
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.ippAuthCode.create({
    data: {
      token: randomToken(),
      email: opts.email,
      code: opts.code,
      next: opts.next,
      firstName: opts.firstName || null,
      lastName: opts.lastName || null,
      company: opts.company || null,
      expiresAt,
    },
  });

  const { sent } = await sendEmail({
    to: opts.email,
    subject: opts.subject,
    html: opts.html,
  });

  const devCode = !sent && process.env.NODE_ENV !== "production" ? opts.code : undefined;
  if (!sent && !devCode) {
    return { ok: false as const, error: "We couldn't send your code. Please try again." };
  }
  return { ok: true as const, email: opts.email, next: opts.next, devCode };
}

/** Sign in — email only. */
export async function requestSignInCode(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const next = safeNext(formData.get("next"));

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  return finishIssue({
    email,
    next,
    code,
    subject: `${code} is your iPartner sign-in code`,
    html: codeEmail(code, "sign-in"),
  });
}

/** Alias kept for LoginForm. */
export async function requestAuthCode(_prev: unknown, formData: FormData) {
  return requestSignInCode(_prev, formData);
}

// Step 2 — email + code → session (+ create ipp_partners when the code carried a name).
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

  // Signup codes carry a name — persist the partner profile before the session lands.
  if (record.firstName && record.lastName) {
    await prisma.ippPartner.upsert({
      where: { email },
      create: {
        email,
        firstName: record.firstName,
        lastName: record.lastName,
        company: record.company,
      },
      update: {
        firstName: record.firstName,
        lastName: record.lastName,
        company: record.company,
      },
    });
  }

  await createSession(email);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/** On-brand verification email (dark iPartners palette). */
function codeEmail(code: string, kind: "sign-in" | "verify"): string {
  const title = kind === "verify" ? "Your verification code" : "Your sign-in code";
  const blurb =
    kind === "verify"
      ? "Enter this code to finish verifying your iPartner account. It expires in 10 minutes."
      : "Enter this code to access your iPartner account. It expires in 10 minutes.";
  const logo =
    process.env.NEXT_PUBLIC_LOGO_URL ||
    "https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png";
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0A0F0D;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#111916;border:1px solid #1E2D25;border-radius:16px;overflow:hidden">
      <div style="padding:28px 28px 8px;text-align:center">
        <img src="${logo}" alt="iPartner" height="40" style="height:40px;width:auto;margin:0 auto 16px;display:block" />
        <h1 style="color:#fff;font-size:20px;margin:0 0 6px">${title}</h1>
        <p style="color:#8B9E93;font-size:14px;margin:0">${blurb}</p>
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
    <p style="color:#5A6E62;font-size:11px;text-align:center;margin:16px 0 0">iPartner — a VNOC venture</p>
  </div>`;
}
