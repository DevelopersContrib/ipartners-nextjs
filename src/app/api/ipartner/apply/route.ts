import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail, escapeHtml } from '@/lib/ses';

interface ApplyPayload {
  domain: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  phone?: string;
  linkedIn?: string;
  employer?: string;
  industry?: string;
  timeCommitment?: string;
  areasOfExpertise?: string;
  ideasMonetization?: string;
  resourcesBringing?: string;
  resourcesToolsNeeded?: string;
  partnershipGoalsShortLong?: string;
  businessAdviceYoung?: string;
  expectationsContrib?: string;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function required(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export async function POST(request: NextRequest) {
  let body: ApplyPayload;
  try {
    body = (await request.json()) as ApplyPayload;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const domain = required(body.domain);
  const email = required(body.email);
  const firstName = required(body.firstName);
  const lastName = required(body.lastName);

  if (!domain || !email || !firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: 'domain, email, firstName, lastName are required' },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
  }

  const location =
    [str(body.city, 100), str(body.country, 100)].filter(Boolean).join(', ') || null;

  const data = {
    firstname: str(firstName, 25),
    lastname: str(lastName, 25),
    email: str(email, 50)!,
    phone: str(body.phone, 25),
    linkedin: str(body.linkedIn, 100),
    employer: str(body.employer, 100),
    location: location ? location.slice(0, 255) : null,
    domain_name: str(domain, 50)!,
    industry: str(body.industry, 50),
    time_commitment: str(body.timeCommitment, 25),
    areas_of_expertise: str(body.areasOfExpertise, 65_535),
    concept_ideas: str(body.ideasMonetization, 65_535),
    resources: str(body.resourcesBringing, 65_535),
    partnership_goals: str(body.partnershipGoalsShortLong, 65_535),
    business_advice: str(body.businessAdviceYoung, 65_535),
    resources_needed: str(body.resourcesToolsNeeded, 65_535),
    expectations: str(body.expectationsContrib, 65_535),
  };

  const existing = await prisma.iPartner.findFirst({
    where: { email: data.email, domain_name: data.domain_name },
    select: { ipartner_id: true },
  });

  let isUpdate = false;
  let id: number;
  if (existing) {
    await prisma.iPartner.update({
      where: { ipartner_id: existing.ipartner_id },
      data,
    });
    id = existing.ipartner_id;
    isUpdate = true;
  } else {
    const created = await prisma.iPartner.create({
      data: { ...data, date_submitted: new Date() },
      select: { ipartner_id: true },
    });
    id = created.ipartner_id;
  }

  const humanMessage = isUpdate
    ? `You already have an existing iPartner application to ${data.domain_name} but you have successfully edited your iPartner application.`
    : `Thank you for applying to partner with ${data.domain_name}. Our team will review your application and reach out.`;

  // Fire-and-note email sends (don't fail the request if SES errors)
  const applicantEmail = sendApplicantEmail({
    to: data.email,
    firstName: data.firstname ?? firstName,
    domain: data.domain_name,
    isUpdate,
  }).catch((err) => {
    console.error('[ipartner] applicant email failed:', err);
    return null;
  });

  const notify = process.env.IPARTNER_NOTIFICATION_EMAIL;
  const adminEmail = notify
    ? sendAdminEmail({ to: notify, data, id, isUpdate }).catch((err) => {
        console.error('[ipartner] admin email failed:', err);
        return null;
      })
    : Promise.resolve(null);

  await Promise.all([applicantEmail, adminEmail]);

  return NextResponse.json({
    success: true,
    id,
    isUpdate,
    message: humanMessage,
  });
}

async function sendApplicantEmail(args: {
  to: string;
  firstName: string;
  domain: string;
  isUpdate: boolean;
}) {
  const subject = args.isUpdate
    ? `Your iPartner application for ${args.domain} has been updated`
    : `We received your iPartner application for ${args.domain}`;
  const opener = args.isUpdate
    ? `Thanks — your iPartner application for <strong>${escapeHtml(args.domain)}</strong> has been updated.`
    : `Thanks for applying to partner with <strong>${escapeHtml(args.domain)}</strong>. We've received your application.`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Hi ${escapeHtml(args.firstName)},</h2>
      <p>${opener}</p>
      <p>Our team will review and follow up with next steps. If you need to reach us in the meantime, just reply to this email.</p>
      <p style="margin-top:24px;color:#64748b;font-size:12px">— The iPartner team</p>
    </div>
  `;
  const text = `Hi ${args.firstName},\n\n${args.isUpdate ? `Your iPartner application for ${args.domain} has been updated.` : `Thanks for applying to partner with ${args.domain}. We've received your application.`}\n\nOur team will review and follow up.\n\n— The iPartner team`;
  return sendEmail({ to: args.to, subject, html, text });
}

async function sendAdminEmail(args: {
  to: string;
  data: Record<string, unknown>;
  id: number;
  isUpdate: boolean;
}) {
  const subject = args.isUpdate
    ? `[iPartner] Application updated (#${args.id}) — ${args.data.domain_name}`
    : `[iPartner] New application (#${args.id}) — ${args.data.domain_name}`;
  const rows = Object.entries(args.data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${escapeHtml(String(v ?? ''))}</td></tr>`
    )
    .join('');
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a">
      <h3 style="margin:0 0 12px">${args.isUpdate ? 'Application updated' : 'New application'} — #${args.id}</h3>
      <table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>
    </div>
  `;
  return sendEmail({ to: args.to, subject, html });
}
