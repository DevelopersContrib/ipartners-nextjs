import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DomainPartnershipView from "@/components/DomainPartnershipView";
import {
  formatDomainDisplay,
  getBrandByDomain,
  getVerticalBrandsByValue,
  inferVerticalForBrand,
  normalizeDomainHost,
} from "@/lib/vertical-brands";

type Props = { params: Promise<{ domain: string }> };

/** Live VNOC managedomain + analytics — same cadence as vertical pages. */
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: raw } = await params;
  const host = normalizeDomainHost(decodeURIComponent(raw || ""));
  const display = formatDomainDisplay(host);
  const brand = host ? await getBrandByDomain(host) : null;

  const title = brand
    ? `${display} — partnership & PartnerScore · iPartner`
    : `${display || "Domain"} — iPartner`;

  const description = brand
    ? `Partner on ${display}. PartnerScore ${brand.partnerScore}/100 — live traffic, demand, and asset signals from VNOC. Apply to build, sponsor, or operate.`
    : `Partnership opportunities on premium domains — apply through iPartner.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://ipartner.com/d/${encodeURIComponent(host)}`,
    },
  };
}

export default async function DomainPartnershipPage({ params }: Props) {
  const { domain: raw } = await params;
  const host = normalizeDomainHost(decodeURIComponent(raw || ""));
  if (!host || !host.includes(".")) notFound();

  const brand = await getBrandByDomain(host);
  if (!brand) notFound();

  const vertical = inferVerticalForBrand(brand.categoryId, brand.domainName);
  const { brands: verticalBrands } = await getVerticalBrandsByValue(vertical.slug, 12);
  const related = verticalBrands
    .filter((b) => b.domainName.toLowerCase() !== host)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: formatDomainDisplay(brand.domainName),
    description: `Partnership opportunity on ${brand.domainName}`,
    url: `https://ipartner.com/d/${encodeURIComponent(host)}`,
    category: brand.categoryName ?? vertical.name,
    offers: brand.askingPrice
      ? {
          "@type": "Offer",
          price: brand.askingPrice,
          priceCurrency: "USD",
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DomainPartnershipView
        brand={{ ...brand, verticalSlug: vertical.slug, verticalName: vertical.name }}
        related={related}
        variant="public"
      />
    </>
  );
}
