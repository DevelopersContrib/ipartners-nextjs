import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { VERTICALS } from "@/lib/verticals";
import { SPONSOR_TIERS } from "@/lib/admin-client";
import { sponsorCheckoutHref, SPONSOR_TIER_PRICES_USD } from "@/lib/sponsor-pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy placements — iPartner",
  robots: { index: false },
};

const EXAMPLES = [
  {
    title: "Homepage hero",
    blurb: "Category sites with strong monthly traffic. Checkout as a sponsor by tier.",
    price: "From $500/yr",
  },
  {
    title: "Newsletter sponsorship",
    blurb: "Dedicated or shared placements across partner audiences.",
    price: "Included in tier",
  },
  {
    title: "Podcast / media",
    blurb: "Episode and show sponsorships via the sponsor track.",
    price: "Included in tier",
  },
];

export default async function PlacementsPage() {
  await requirePartner("/portal/placements");
  const defaultVertical = VERTICALS[0]?.slug || "domains";
  const defaultTier = SPONSOR_TIERS[1]; // silver

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          Buy placements
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Checkout annual sponsorships with PayDirect (card or crypto). Pick a vertical + tier
          — we approve your engagement when payment settles.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <li
            key={ex.title}
            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-zinc-900">{ex.title}</p>
            <p className="flex-1 text-xs leading-relaxed text-zinc-500">{ex.blurb}</p>
            <p className="text-xs text-zinc-400">{ex.price}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900">Checkout by tier</p>
        <p className="text-xs text-zinc-500">
          Starting vertical: {VERTICALS[0]?.name || "Domains"}. You can change vertical on the
          checkout URL (&amp;vertical=).
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {SPONSOR_TIERS.map((t) => (
            <Link
              key={t}
              href={sponsorCheckoutHref({ tier: t, vertical: defaultVertical })}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold capitalize text-zinc-800 hover:bg-white sm:flex-none"
            >
              {t} · ${SPONSOR_TIER_PRICES_USD[t].replace(/\.00$/, "")}/yr
            </Link>
          ))}
        </div>
        <Link
          href={sponsorCheckoutHref({
            tier: defaultTier,
            vertical: defaultVertical,
          })}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto"
        >
          Checkout {defaultTier}
        </Link>
      </div>
    </div>
  );
}
