import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentPartner } from "@/lib/auth";
import { isSponsorTier } from "@/lib/admin-client";
import { sponsorTierAmount } from "@/lib/sponsor-pricing";
import { paydirectApiKey, paydirectConfigured } from "@/lib/paydirect";
import { VERTICALS } from "@/lib/verticals";
import SponsorCheckoutWidget from "@/components/paydirect/SponsorCheckoutWidget";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsor checkout — iPartner",
  robots: { index: false, follow: false },
};

export default async function SponsorCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    tier?: string;
    vertical?: string;
    engagement?: string;
  }>;
}) {
  const params = await searchParams;
  const tier = (params.tier || "").trim().toLowerCase();
  if (!isSponsorTier(tier)) notFound();

  const amount = sponsorTierAmount(tier);
  if (!amount) notFound();

  const verticalSlug = (params.vertical || VERTICALS[0]?.slug || "domains").trim();
  const verticalMeta = VERTICALS.find((v) => v.slug === verticalSlug);
  const verticalLabel = verticalMeta?.name || verticalSlug;

  const partner = await getCurrentPartner();
  const email = partner?.email || "";
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://ipartner.com";
  const returnUrl = `${base}/checkout/sponsor/success?tier=${encodeURIComponent(tier)}`;
  const cancelUrl = `${base}/checkout/sponsor?tier=${encodeURIComponent(tier)}&vertical=${encodeURIComponent(verticalSlug)}`;

  const apiKey = paydirectApiKey();
  const configured = paydirectConfigured();

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ipp-accent)]">
            Checkout
          </p>
          <h1 className="text-2xl font-bold text-[var(--ipp-text)] capitalize">
            {tier} sponsorship
          </h1>
          <p className="text-sm text-[var(--ipp-secondary)] leading-relaxed">
            Annual placement for <strong className="text-[var(--ipp-text)]">{verticalLabel}</strong>{" "}
            — ${amount} USD/year. Pay with card or crypto (USDC) via PayDirect.
          </p>
        </header>

        {!partner && (
          <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
            <Link href={`/login?next=${encodeURIComponent(`/checkout/sponsor?tier=${tier}&vertical=${verticalSlug}`)}`} className="font-semibold underline underline-offset-2">
              Sign in
            </Link>{" "}
            so we can attach this payment to your partner account. You can still check out;
            use the email you want associated with the sponsorship.
          </p>
        )}

        {partner && (
          <p className="text-xs text-[var(--ipp-secondary)]">
            Paying as <span className="font-mono text-[var(--ipp-text)]">{partner.email}</span>
          </p>
        )}

        {!configured ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm text-[var(--ipp-secondary)]">
            PayDirect is not configured yet. Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_PAYDIRECT_API_KEY</code>{" "}
            (or <code className="font-mono text-xs">PAYDIRECT_API_KEY</code>) in env, and
            configure a workspace settlement address in the PayDirect dashboard.
            Until then,{" "}
            <Link
              href={`/apply?mode=sponsor&tier=${tier}&vertical=${encodeURIComponent(verticalSlug)}`}
              className="font-semibold text-[var(--ipp-text)] underline underline-offset-2"
            >
              register interest
            </Link>
            .
          </div>
        ) : !email ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-3 text-sm">
            <p className="text-[var(--ipp-secondary)]">
              Sign in first so checkout metadata includes your email (required for
              fulfillment).
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/checkout/sponsor?tier=${tier}&vertical=${verticalSlug}`)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-primary)] px-5 text-sm font-semibold text-white"
            >
              Sign in to pay
            </Link>
          </div>
        ) : (
          <SponsorCheckoutWidget
            apiKey={apiKey}
            amount={amount}
            tier={tier}
            vertical={verticalSlug}
            email={email}
            engagementId={params.engagement || null}
            returnUrl={returnUrl}
            cancelUrl={cancelUrl}
            description={`iPartner ${tier} sponsorship — ${verticalLabel} (annual)`}
          />
        )}

        <p className="text-xs text-[var(--ipp-secondary)] leading-relaxed">
          Prefer to talk first?{" "}
          <Link
            href={`/apply?mode=sponsor&tier=${tier}&vertical=${encodeURIComponent(verticalSlug)}`}
            className="underline underline-offset-2"
          >
            Apply without paying
          </Link>{" "}
          and we&apos;ll follow up. Settlement is confirmed via PayDirect webhook after
          payment completes.
        </p>
      </div>
    </main>
  );
}
