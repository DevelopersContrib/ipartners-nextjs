import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import DomainReferralLink from "@/components/DomainReferralLink";
import {
  domainPageHref,
  formatBrandStat,
  formatBrandValue,
  formatDomainDisplay,
  type VerticalBrand,
} from "@/lib/vertical-brands";

export type DomainPartnershipProps = {
  brand: VerticalBrand & { verticalSlug: string; verticalName: string };
  related?: VerticalBrand[];
  /** Portal detail adds sticky mobile CTA; public page uses default layout. */
  variant?: "public" | "portal";
};

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-semibold tabular-nums text-zinc-800">{value}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[var(--ipp-accent,#f5c451)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DomainPartnershipView({
  brand: opp,
  related = [],
  variant = "public",
}: DomainPartnershipProps) {
  const applyHref = `/apply?domain=${encodeURIComponent(opp.domainName)}`;
  const sponsorHref = `/apply?mode=sponsor&domain=${encodeURIComponent(opp.domainName)}`;

  return (
    <div
      className={
        variant === "portal"
          ? "relative mx-auto max-w-3xl space-y-6 pb-24 sm:space-y-8 sm:pb-0"
          : "mx-auto max-w-4xl space-y-8 px-4 py-10 sm:space-y-10 sm:px-6 sm:py-14 lg:px-8"
      }
    >
      {variant === "portal" ? (
        <Link
          href="/portal/discover"
          className="inline-flex min-h-10 items-center text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          ← Back to Discover
        </Link>
      ) : (
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 hover:underline">
            iPartner
          </Link>
          <span aria-hidden>/</span>
          <Link href="/verticals" className="hover:text-zinc-900 hover:underline">
            Verticals
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/verticals/${opp.verticalSlug}`}
            className="hover:text-zinc-900 hover:underline"
          >
            {opp.verticalName}
          </Link>
        </nav>
      )}

      <header className="flex items-start gap-4 sm:gap-5">
        <BrandLogo domain={opp.domainName} size={variant === "public" ? 64 : 56} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
            {opp.verticalName}
            {opp.categoryName ? ` · ${opp.categoryName}` : ""}
          </p>
          <h1
            className={
              variant === "public"
                ? "mt-1 break-words text-3xl font-bold tracking-tight text-[var(--ipp-text,#031d2f)] sm:text-4xl"
                : "mt-1 break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
            }
          >
            {formatDomainDisplay(opp.domainName)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Open partnership on this premium domain. Apply to build, sponsor, operate, or
            distribute — scored live from VNOC inventory, traffic, and demand signals.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:col-span-1 sm:p-5">
          <p className="text-xs text-zinc-500">PartnerScore</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--ipp-text,#031d2f)]">
            {opp.partnerScore || "—"}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{opp.partnerLabel}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-5">
          <p className="text-xs text-zinc-500">Visitors · 30d</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.uniqueVisitors30d > 0 ? formatBrandStat(opp.uniqueVisitors30d) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-5">
          <p className="text-xs text-zinc-500">Pageviews · 30d</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.pageviews30d > 0 ? formatBrandStat(opp.pageviews30d) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-5">
          <p className="text-xs text-zinc-500">Asset signal</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.value > 0 ? formatBrandValue(opp.value) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-5">
          <p className="text-xs text-zinc-500">Leads / offers</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {formatBrandStat(opp.leads)} / {formatBrandStat(opp.offers)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-5">
          <p className="text-xs text-zinc-500">Network partners</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {opp.partners > 0 ? formatBrandStat(opp.partners) : "—"}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Score breakdown</h2>
          <p className="text-xs leading-relaxed text-zinc-500">
            PartnerScore (0–100) combines live traffic, network depth, inbound demand, and asset
            value — the same venture signal used on vertical pages and admin triage.
          </p>
          <div className="space-y-3 pt-1">
            <ScoreBar label="Traffic" value={opp.partnerBreakdown.traffic} max={40} />
            <ScoreBar label="Network" value={opp.partnerBreakdown.network} max={20} />
            <ScoreBar label="Demand" value={opp.partnerBreakdown.demand} max={20} />
            <ScoreBar label="Asset" value={opp.partnerBreakdown.asset} max={20} />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--border,#e4e4e7)] bg-[var(--ipp-primary,#031d2f)] p-4 text-white sm:p-6">
          <h2 className="text-sm font-semibold">Send your partnership</h2>
          <p className="text-sm leading-relaxed text-white/80">
            Tell us how you&apos;d grow {formatDomainDisplay(opp.domainName)} — builder, sponsor,
            operator, or distributor. We review every application.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href={applyHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-accent,#f5c451)] px-5 text-sm font-semibold text-[var(--ipp-text,#031d2f)] hover:brightness-105"
            >
              Apply for partnership →
            </Link>
            <Link
              href={sponsorHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sponsor this domain
            </Link>
            <DomainReferralLink
              domain={opp.domainName}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white/90 hover:bg-white/5"
            >
              Visit live site →
            </DomainReferralLink>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--ipp-text,#031d2f)]">
            Related domains
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((b) => (
              <li key={b.domainName}>
                <Link
                  href={domainPageHref(b.domainName)}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border,#e4e4e7)] bg-white p-3 transition hover:border-[var(--ipp-accent,#f5c451)]"
                >
                  <BrandLogo domain={b.domainName} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {formatDomainDisplay(b.domainName)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Score {b.partnerScore} · {formatBrandValue(b.value)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {variant === "portal" ? (
        <>
          <div className="hidden flex-wrap gap-3 sm:flex">
            <Link
              href={applyHref}
              className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Apply now
            </Link>
            <Link
              href={sponsorHref}
              className="inline-flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Sponsor interest
            </Link>
          </div>
          <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-zinc-200/80 bg-white/95 p-3 backdrop-blur-xl sm:hidden">
            <div className="mx-auto flex max-w-3xl gap-2">
              <Link
                href={applyHref}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white"
              >
                Apply now
              </Link>
              <Link
                href={sponsorHref}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800"
              >
                Sponsor
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-zinc-400">
          Live inventory synced from VNOC managedomain · traffic from analytics.vnoc.com ·
          refreshed hourly.
        </p>
      )}
    </div>
  );
}
