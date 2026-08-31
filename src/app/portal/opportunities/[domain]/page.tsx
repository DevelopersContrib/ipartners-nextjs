import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DomainPartnershipView from "@/components/DomainPartnershipView";
import { requirePartner } from "@/lib/auth";
import { getOpportunityByDomain } from "@/lib/portal-opportunities";
import { getVerticalBrandsByValue } from "@/lib/vertical-brands";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opportunity — iPartner",
  robots: { index: false },
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  await requirePartner();
  const { domain: raw } = await params;
  const domain = decodeURIComponent(raw || "").trim().toLowerCase();
  if (!domain || !domain.includes(".")) notFound();

  const opp = await getOpportunityByDomain(domain);
  if (!opp) notFound();

  const { brands: verticalBrands } = await getVerticalBrandsByValue(opp.verticalSlug, 12);
  const related = verticalBrands
    .filter((b) => b.domainName.toLowerCase() !== domain)
    .slice(0, 4);

  return (
    <DomainPartnershipView brand={opp} related={related} variant="portal" />
  );
}
