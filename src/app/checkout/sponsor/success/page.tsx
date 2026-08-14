import type { Metadata } from "next";
import Link from "next/link";
import { isSponsorTier } from "@/lib/admin-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment received — iPartner",
  robots: { index: false, follow: false },
};

export default async function SponsorCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const tier = (params.tier || "").toLowerCase();
  const tierLabel = isSponsorTier(tier) ? tier : "sponsor";

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-14">
      <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Thank you
        </p>
        <h1 className="text-2xl font-bold text-[var(--ipp-text)] capitalize">
          {tierLabel} payment started
        </h1>
        <p className="text-sm leading-relaxed text-[var(--ipp-secondary)]">
          We recorded your PayDirect checkout. Final settlement may take a moment (card or
          on-chain confirmations). We&apos;ll approve your sponsorship engagement once
          payment is confirmed.
        </p>
        {params.payment && (
          <p className="font-mono text-xs text-[var(--ipp-secondary)] break-all">
            Payment ID: {params.payment}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/portal/deals"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-primary)] px-5 text-sm font-semibold text-white"
          >
            Open deals
          </Link>
          <Link
            href="/portal/placements"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-[var(--ipp-text)]"
          >
            Placements
          </Link>
        </div>
      </div>
    </main>
  );
}
