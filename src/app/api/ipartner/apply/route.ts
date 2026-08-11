import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail, escapeHtml } from '@/lib/ses';
import { coerceMode, createEngagement } from '@/lib/engagements';
import { notifyEngagementStatus } from '@/lib/campaigns';

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
  /** Optional engagement mode — defaults to domain_owner for this rich domain form. */
  mode?: string;
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

  // Applicant lifecycle mail goes through SES campaigns (idempotent).
  // Admin ops alert stays a one-off SES send.
  const NOTIFICATION_EMAILS = [
    'admin@domaindirectory.com',
    'chad@ecorp.com',
    'maida@vnoc.com',
    'kjabellar@gmail.com',
  ];

  const adminEmail = sendAdminEmail({ to: NOTIFICATION_EMAILS, data, id, isUpdate }).catch(
    (err) => {
      console.error('[ipartner] admin email failed:', err);
      return null;
    }
  );

  let engagementId: bigint | null = null;
  const mode = coerceMode(body.mode) || 'domain_owner';
  try {
    const engagement = await createEngagement({
      email: data.email,
      mode,
      scopeType: 'domain',
      scopeValue: data.domain_name,
      status: 'pending',
      sourceTable: 'IPartner',
      sourceId: id,
      applicationJson: {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        linkedIn: data.linkedin,
        employer: data.employer,
        location: data.location,
        domain: data.domain_name,
        industry: data.industry,
        timeCommitment: data.time_commitment,
        areasOfExpertise: data.areas_of_expertise,
        ideasMonetization: data.concept_ideas,
        resourcesBringing: data.resources,
        partnershipGoalsShortLong: data.partnership_goals,
        businessAdviceYoung: data.business_advice,
        resourcesToolsNeeded: data.resources_needed,
        expectationsContrib: data.expectations,
        mode,
      },
    });
    engagementId = engagement.id;
    if (engagement.status !== "declined") {
      void notifyEngagementStatus(
        {
          id: engagement.id,
          email: engagement.email,
          mode: engagement.mode,
          scopeValue: engagement.scopeValue,
          status: engagement.status,
          tier: engagement.tier,
          firstName: data.firstname ?? firstName,
        },
        // Re-apply / edit should still confirm — force so partners get the update notice.
        { force: isUpdate, firstName: data.firstname ?? firstName }
      ).catch((err) => console.error('[ipartner] campaign failed:', err));
    }
  } catch (engErr) {
    console.error('[ipartner] engagement write failed:', engErr);
  }

  await adminEmail;

  return NextResponse.json({
    success: true,
    id,
    engagement_id: engagementId != null ? String(engagementId) : undefined,
    isUpdate,
    message: humanMessage,
    next: '/portal/deals?applied=1',
  });
}

async function sendAdminEmail(args: {
  to: string | string[];
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
