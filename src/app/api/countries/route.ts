import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/api';
import { FALLBACK_COUNTRIES } from '@/lib/form-options';

export async function GET() {
  try {
    const rawCountries = await getCountries();

    let countriesList: { id: string; name: string }[] = [];

    if (Array.isArray(rawCountries)) {
      countriesList = rawCountries
        .map((c: Record<string, string>, i: number) => ({
          id: String(c.country_id || c.id || c.code || i + 1),
          name: String(c.name || '').trim(),
        }))
        .filter((c) => c.name);
    } else if (
      rawCountries &&
      typeof rawCountries === 'object' &&
      'value' in (rawCountries as Record<string, unknown>)
    ) {
      const val = (rawCountries as Record<string, unknown>).value;
      if (Array.isArray(val)) {
        countriesList = val
          .map((c: Record<string, string>, i: number) => ({
            id: String(c.country_id || c.id || c.code || i + 1),
            name: String(c.name || '').trim(),
          }))
          .filter((c) => c.name);
      }
    }

    if (countriesList.length === 0) {
      return NextResponse.json({ countries: FALLBACK_COUNTRIES, fallback: true });
    }

    return NextResponse.json({ countries: countriesList });
  } catch {
    return NextResponse.json(
      { countries: FALLBACK_COUNTRIES, fallback: true },
      { status: 200 },
    );
  }
}
