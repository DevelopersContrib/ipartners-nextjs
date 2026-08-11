import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { FALLBACK_FORM_DATA, resolveFormData } from '@/lib/form-options';

export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({
      ...config,
      formData: resolveFormData(config.formData),
    });
  } catch {
    return NextResponse.json(
      {
        domain: 'ipartner.com',
        domainInfo: null,
        formData: FALLBACK_FORM_DATA,
      },
      { status: 200 },
    );
  }
}
