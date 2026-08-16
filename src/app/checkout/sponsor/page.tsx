import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentPartner } from "@/lib/auth";
import { isSponsorTier } from "@/lib/admin-client";
import {
  normalizeSponsorDomain,
  sponsorTierAmount,
  sponsorTierDetail,
} from "@/lib/sponsor-pricing";
import { paydirectConfigured } from "@/lib/paydirect";
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
    domain?: string;
    scope?: string;
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

  // Domain scope only when the requested host is a valid bare hostname.
  const domain =
    params.scope === "vertical" ? "" : normalizeSponsorDomain(params.domain);
  const scopeType = domain ? "domain" : "vertical";
  const scopeValue = domain || verticalSlug;
  const scopeLabel = domain || verticalLabel;

  const detail = sponsorTierDetail(tier);
  const partner = await getCurrentPartner();
  const email = partner?.email || "";
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://ipartner.com";
  const returnUrl = `${base}/checkout/sponsor/success?tier=${encodeURIComponent(tier)}`;
  const cancelParams = new URLSearchParams({ tier, vertical: verticalSlug });
  if (domain) {
    cancelParams.set("scope", "domain");
    cancelParams.set("domain", domain);
  }
  const cancelUrl = `${base}/checkout/sponsor?${cancelParams.toString()}`;
  const signInNext = `/checkout/sponsor?${cancelParams.toString()}`;
  const applyHref = `/apply?mode=sponsor&tier=${tier}&vertical=${encodeURIComponent(verticalSlug)}`;

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
            Annual placement on{" "}
            <strong className="text-[var(--ipp-text)]">{scopeLabel}</strong>
            {domain ? (
              <>
                {" "}
                (single domain in {verticalLabel})
              </>
            ) : (
              <> (whole category)</>
            )}{" "}
            — ${amount} USD/year. Pay with card or crypto (USDC) via PayDirect.
          </p>
        </header>

        {detail && (
          <ul className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-4">
            {detail.features[scopeType].map((f) => (
              <li
                key={f}
                className="flex gap-2 text-xs leading-relaxed text-[var(--ipp-secondary)]"
              >
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--ipp-accent)]"
                  aria-hidden
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {!partner && (
          <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
            <Link
              href={`/login?next=${encodeURIComponent(signInNext)}`}
              className="font-semibold underline underline-offset-2"
            >
              Sign in
            </Link>{" "}
            so we can attach this payment to your partner account.
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
            <code className="font-mono text-xs">PAYDIRECT_API_KEY</code> in env, and
            configure a workspace settlement address in the PayDirect dashboard.
            Until then,{" "}
            <Link
              href={applyHref}
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
              href={`/login?next=${encodeURIComponent(signInNext)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-primary)] px-5 text-sm font-semibold text-white"
            >
              Sign in to pay
            </Link>
          </div>
        ) : (
          <SponsorCheckoutWidget
            amount={amount}
            tier={tier}
            vertical={verticalSlug}
            scopeType={scopeType}
            scopeValue={scopeValue}
            email={email}
            engagementId={params.engagement || null}
            returnUrl={returnUrl}
            cancelUrl={cancelUrl}
            description={`iPartner ${tier} sponsorship — ${scopeLabel} (annual)`}
          />
        )}

        <p className="text-xs text-[var(--ipp-secondary)] leading-relaxed">
          Prefer to talk first?{" "}
          <Link href={applyHref} className="underline underline-offset-2">
            Apply without paying
          </Link>{" "}
          and we&apos;ll follow up. Settlement is confirmed via PayDirect webhook after
          payment completes.
        </p>
      </div>
    </main>
  );
}
