import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { domain: 'ipartner.com', domainInfo: null, formData: null },
      { status: 500 }
    );
  }
}
