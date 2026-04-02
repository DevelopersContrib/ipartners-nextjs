import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/api';

export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json({ countries });
  } catch {
    return NextResponse.json({ countries: [] }, { status: 500 });
  }
}
