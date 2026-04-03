import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/api';

export async function GET() {
  try {
    const rawCountries = await getCountries();

    // API returns { value: [{ country_id, name, code, ... }] } or an array directly
    let countriesList: { id: string; name: string }[] = [];

    if (Array.isArray(rawCountries)) {
      countriesList = rawCountries.map((c: Record<string, string>) => ({
        id: c.country_id || c.id || c.code || '',
        name: c.name || '',
      }));
    } else if (rawCountries && typeof rawCountries === 'object' && 'value' in (rawCountries as Record<string, unknown>)) {
      const val = (rawCountries as Record<string, unknown>).value;
      if (Array.isArray(val)) {
        countriesList = val.map((c: Record<string, string>) => ({
          id: c.country_id || c.id || c.code || '',
          name: c.name || '',
        }));
      }
    }

    return NextResponse.json({ countries: countriesList });
  } catch {
    return NextResponse.json({ countries: [] }, { status: 500 });
  }
}
