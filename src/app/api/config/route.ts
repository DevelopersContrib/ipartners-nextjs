import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';

// Fallback form data when external API is unavailable
const fallbackFormData = {
  roles: [
    { id: '1', name: 'Advisor' },
    { id: '2', name: 'Co-founder' },
    { id: '3', name: 'Content Creator' },
    { id: '4', name: 'Designer' },
    { id: '5', name: 'Developer' },
    { id: '6', name: 'Engineer' },
    { id: '7', name: 'Investor' },
    { id: '8', name: 'Marketing' },
    { id: '9', name: 'Operations' },
    { id: '10', name: 'Product Manager' },
    { id: '11', name: 'Sales' },
    { id: '12', name: 'Strategy' },
    { id: '13', name: 'Other' },
  ],
  industries: [
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Finance' },
    { id: '3', name: 'Healthcare' },
    { id: '4', name: 'Education' },
    { id: '5', name: 'E-commerce' },
    { id: '6', name: 'Media & Entertainment' },
    { id: '7', name: 'Real Estate' },
    { id: '8', name: 'Consulting' },
    { id: '9', name: 'Marketing & Advertising' },
    { id: '10', name: 'Other' },
  ],
  experiences: [
    { id: '1', name: 'Less than 1 year' },
    { id: '2', name: '1-3 years' },
    { id: '3', name: '3-5 years' },
    { id: '4', name: '5-10 years' },
    { id: '5', name: '10+ years' },
  ],
  intentions: [
    { id: '1', name: 'Build & Grow' },
    { id: '2', name: 'Invest & Earn' },
  ],
};

export async function GET() {
  try {
    const config = await getSiteConfig();

    // Use fallback form data if the external API didn't return any
    return NextResponse.json({
      ...config,
      formData: config.formData || fallbackFormData,
    });
  } catch {
    return NextResponse.json(
      {
        domain: 'ipartner.com',
        domainInfo: null,
        formData: fallbackFormData,
      },
      { status: 200 } // Return 200 with fallback so forms still work
    );
  }
}
