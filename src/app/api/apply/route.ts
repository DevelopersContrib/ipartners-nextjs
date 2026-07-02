import { NextRequest, NextResponse } from 'next/server';

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
  const messageParts = [
    body.message ? String(body.message) : '',
    body.intention ? `Intention: ${body.intention}` : '',
    body.experience ? `Experience: ${body.experience}` : '',
    body.role ? `Role: ${body.role}` : '',
    `Partnership type: ${partnershipType}`,
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
        source: `ipartners.com:${partnershipType}`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? 'Upstream save failed' },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      ipartner_id: (data as { ipartner_id?: number }).ipartner_id,
    });
  } catch (err) {
    console.error('[api/apply]', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
