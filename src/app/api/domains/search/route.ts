import { NextResponse } from "next/server";
import {
  domainPageHref,
  formatDomainDisplay,
  inferVerticalForBrand,
  searchBrandsByQuery,
} from "@/lib/vertical-brands";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ domains: [] });
  }

  const brands = await searchBrandsByQuery(q, 12);
  return NextResponse.json({
    domains: brands.map((b) => {
      const vertical = inferVerticalForBrand(b.categoryId, b.domainName);
      return {
        domainName: b.domainName,
        displayName: formatDomainDisplay(b.domainName),
        partnerScore: b.partnerScore,
        value: b.value,
        categoryName: b.categoryName,
        verticalSlug: vertical.slug,
        verticalName: vertical.name,
        href: domainPageHref(b.domainName),
      };
    }),
  });
}
