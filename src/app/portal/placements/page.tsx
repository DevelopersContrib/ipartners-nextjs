import type { Metadata } from "next";
import { requirePartner } from "@/lib/auth";
import { VERTICALS } from "@/lib/verticals";
import PlacementConfigurator, {
  type PlacementCategory,
} from "@/components/portal/PlacementConfigurator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy placements — iPartner",
  robots: { index: false },
};

export default async function PlacementsPage() {
  await requirePartner("/portal/placements");

  const categories: PlacementCategory[] = VERTICALS.map((v) => ({
    slug: v.slug,
    name: v.name,
    blurb: v.blurb,
    domains: v.domains,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          Buy placements
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Choose where the sponsorship runs — a whole category or one premium domain — then
          pick a tier. Checkout is annual via PayDirect (card or crypto).
        </p>
      </header>

      <PlacementConfigurator categories={categories} />
    </div>
  );
}
