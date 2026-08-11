import { NextRequest, NextResponse } from 'next/server';
import { coerceMode, createEngagement } from '@/lib/engagements';
import { notifyEngagementStatus } from '@/lib/campaigns';
import { normalizeInboundRef } from '@/lib/inbound-platforms';

const INGEST_URL =
  process.env.VNOC_PARTNERSHIP_INGEST_URL?.trim() ||
  'https://api.vnoc.com/api/v1/partnerships';

const INGEST_KEY = process.env.VNOC_INGEST_KEY?.trim() || '';

type PartnershipType = 'domain' | 'apps' | 'leaders' | 'product-service';

/**
 * POST /api/apply — iPartners.com application → VNOC unified IPartner intake
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const domain = String(body.domain ?? body.target_domain ?? 'ipartner.com')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '');
  const email = String(body.email ?? '').trim().toLowerCase();
  const firstname = String(body.firstname ?? '').trim();
  const lastname = String(body.lastname ?? '').trim();
  const name = [firstname, lastname].filter(Boolean).join(' ') || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const partnershipType = String(body.partnershipType ?? 'domain') as PartnershipType;
  const referralSource = normalizeInboundRef(
    String(body.referral_source ?? body.ref ?? ''),
  );
  const mode =
    coerceMode(String(body.mode ?? '')) ||
    coerceMode(partnershipType) ||
    'builder';
  const vertical = body.vertical ? String(body.vertical).trim() : '';
  const tierRaw = body.tier ? String(body.tier).trim().toLowerCase() : '';
  const tier = mode === 'sponsor' && tierRaw ? tierRaw : null;

  if (mode === 'sponsor') {
    if (!vertical) {
      return NextResponse.json(
        { error: 'Sponsor applications require a vertical' },
        { status: 400 },
      );
    }
    if (!tier || !['bronze', 'silver', 'gold'].includes(tier)) {
      return NextResponse.json(
        { error: 'Sponsor applications require a tier (bronze, silver, or gold)' },
        { status: 400 },
      );
    }
  }

  const messageParts = [
    body.message ? String(body.message) : '',
    body.intention ? `Intention: ${body.intention}` : '',
    body.experience ? `Experience: ${body.experience}` : '',
    body.role ? `Role: ${body.role}` : '',
    `Partnership type: ${partnershipType}`,
    `Mode: ${mode}`,
    vertical ? `Vertical: ${vertical}` : '',
    tier ? `Tier: ${tier}` : '',
    referralSource ? `Referred from: ${referralSource}` : '',
  ].filter(Boolean);

  if (!INGEST_KEY) {
    console.error('[api/apply] VNOC_INGEST_KEY not configured');
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vnoc-key': INGEST_KEY,
      },
      body: JSON.stringify({
        domain,
        email,
        name,
        phone: body.phone ? String(body.phone) : null,
        company: body.company ? String(body.company) : null,
        message: messageParts.join('\n'),
        partnership_goals: body.message ? String(body.message) : null,
        areas_of_expertise: body.role ? String(body.role) : null,
        location: body.country ? String(body.country) : null,
        channel: 'ipartner',
        partnership_type: partnershipType,
        source: referralSource
          ? `ipartners.com:${partnershipType}:ref:${referralSource}`
          : `ipartners.com:${partnershipType}`,
        referral_source: referralSource,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? 'Upstream save failed' },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    const ipartnerId = (data as { ipartner_id?: number }).ipartner_id;

    let engagementId: string | undefined;
    try {
      const engagement = await createEngagement({
        email,
        mode,
        scopeType: vertical ? 'vertical' : 'domain',
        scopeValue: vertical || domain,
        status: 'pending',
        tier: mode === 'sponsor' ? tier : null,
        applicationJson: {
          firstname,
          lastname,
          email,
          phone: body.phone ? String(body.phone) : null,
          company: body.company ? String(body.company) : null,
          domain,
          country: body.country ? String(body.country) : null,
          role: body.role ? String(body.role) : null,
          industry: body.industry ? String(body.industry) : null,
          experience: body.experience ? String(body.experience) : null,
          intention: body.intention ? String(body.intention) : null,
          message: body.message ? String(body.message) : null,
          partnershipType,
          mode,
          vertical: vertical || null,
          tier,
          referral_source: referralSource || null,
        },
        ...(ipartnerId != null
          ? { sourceTable: 'IPartner' as const, sourceId: ipartnerId }
          : {}),
      });
      engagementId = String(engagement.id);
      // Skip lifecycle mail for intake auto-declines (disposable / junk).
      if (engagement.status !== "declined") {
        void notifyEngagementStatus(
          {
            id: engagement.id,
            email: engagement.email,
            mode: engagement.mode,
            scopeValue: engagement.scopeValue,
            status: engagement.status,
            tier: engagement.tier,
            firstName: firstname || null,
          },
        ).catch((err) => console.error('[api/apply] campaign failed:', err));
      }
    } catch (engErr) {
      console.error('[api/apply] engagement write failed:', engErr);
    }

    return NextResponse.json({
      success: true,
      ipartner_id: ipartnerId,
      engagement_id: engagementId,
      next: '/portal/deals?applied=1',
    });
  } catch (err) {
    console.error('[api/apply]', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
