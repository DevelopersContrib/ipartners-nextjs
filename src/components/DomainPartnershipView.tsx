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
  /** Portal detail sits above bottom nav; public uses safe-area bottom bar. */
  variant?: "public" | "portal";
};

function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-semibold tabular-nums text-zinc-800">
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[var(--ipp-accent,#8bc53f)] transition-all"
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
  const isPortal = variant === "portal";
  const display = formatDomainDisplay(opp.domainName);
  const applyHref = `/apply?domain=${encodeURIComponent(opp.domainName)}`;
  const sponsorHref = `/apply?mode=sponsor&domain=${encodeURIComponent(opp.domainName)}`;

  return (
    <div
      className={
        isPortal
          ? "relative mx-auto max-w-3xl space-y-6 pb-28 sm:space-y-8 sm:pb-0"
          : "relative mx-auto max-w-4xl space-y-7 px-4 pb-28 pt-8 sm:space-y-10 sm:px-6 sm:pb-14 sm:py-14 lg:px-8"
      }
    >
      {isPortal ? (
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
          <Link
            href="/verticals"
            className="hover:text-zinc-900 hover:underline"
          >
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

      <header className="flex items-start gap-3 sm:gap-5">
        <BrandLogo domain={opp.domainName} size={isPortal ? 56 : 56} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
            {opp.verticalName}
            {opp.categoryName ? ` · ${opp.categoryName}` : ""}
          </p>
          <h1
            className={
              isPortal
                ? "mt-1 break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
                : "mt-1 break-words text-2xl font-bold tracking-tight text-[var(--ipp-text,#0f172a)] sm:text-4xl"
            }
          >
            {display}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Open partnership on this premium domain. Apply to build, sponsor,
            operate, or distribute — scored live from VNOC inventory, traffic,
            and demand signals.
          </p>

          {/* Above-the-fold Apply on mobile — sticky bar remains for always-on access */}
          {!isPortal && (
            <div className="mt-4 flex flex-col gap-2 sm:hidden">
              <Link
                href={applyHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-accent,#8bc53f)] px-5 text-sm font-semibold text-[var(--ipp-text,#0f172a)] shadow-sm active:scale-[0.99]"
              >
                Apply for partnership →
              </Link>
              <Link
                href={sponsorHref}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700"
              >
                Sponsor this domain
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
        <div className="col-span-2 rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:col-span-1 sm:p-5">
          <p className="text-xs text-zinc-500">PartnerScore</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--ipp-text,#0f172a)]">
            {opp.partnerScore || "—"}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
            {opp.partnerLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:p-5">
          <p className="text-xs text-zinc-500">Visitors · 30d</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
            {opp.uniqueVisitors30d > 0
              ? formatBrandStat(opp.uniqueVisitors30d)
              : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:p-5">
          <p className="text-xs text-zinc-500">Pageviews · 30d</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
            {opp.pageviews30d > 0 ? formatBrandStat(opp.pageviews30d) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:p-5">
          <p className="text-xs text-zinc-500">Asset signal</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
            {opp.value > 0 ? formatBrandValue(opp.value) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:p-5">
          <p className="text-xs text-zinc-500">Leads / offers</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
            {formatBrandStat(opp.leads)} / {formatBrandStat(opp.offers)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-3.5 sm:p-5">
          <p className="text-xs text-zinc-500">Network partners</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
            {opp.partners > 0 ? formatBrandStat(opp.partners) : "—"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 rounded-2xl border border-[var(--border,#e4e4e7)] bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            Score breakdown
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">
            PartnerScore (0–100) combines live traffic, network depth, inbound
            demand, and asset value — the same venture signal used on vertical
            pages and admin triage.
          </p>
          <div className="space-y-3 pt-1">
            <ScoreBar
              label="Traffic"
              value={opp.partnerBreakdown.traffic}
              max={40}
            />
            <ScoreBar
              label="Network"
              value={opp.partnerBreakdown.network}
              max={20}
            />
            <ScoreBar
              label="Demand"
              value={opp.partnerBreakdown.demand}
              max={20}
            />
            <ScoreBar
              label="Asset"
              value={opp.partnerBreakdown.asset}
              max={20}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--border,#e4e4e7)] bg-[var(--ipp-primary,#223843)] p-4 text-white sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ipp-accent,#8bc53f)]">
              Primary path
            </p>
            <h2 className="mt-1 text-base font-semibold sm:text-sm">
              Apply for this domain
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            Deep-link to the partnership form for {display}. We review every
            application.
          </p>

          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs font-semibold text-white/90">
              What to include
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-white/70">
              <li>· Your role (builder, sponsor, operator, or distributor)</li>
              <li>· Brief traction or relevant experience</li>
              <li>· How you&apos;d grow {display} in the first 90 days</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-0.5">
            <Link
              href={applyHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--ipp-accent,#8bc53f)] px-5 text-sm font-semibold text-[var(--ipp-text,#0f172a)] shadow-sm hover:brightness-105 active:scale-[0.99]"
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
              className="inline-flex min-h-10 items-center justify-center px-2 text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline"
            >
              Visit live site →
            </DomainReferralLink>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-base font-semibold text-[var(--ipp-text,#0f172a)] sm:text-lg">
            Related domains
          </h2>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {related.map((b) => (
              <li key={b.domainName}>
                <Link
                  href={domainPageHref(b.domainName)}
                  className="flex min-h-[3.5rem] items-center gap-3 rounded-xl border border-[var(--border,#e4e4e7)] bg-white p-3 transition hover:border-[var(--ipp-accent,#8bc53f)] active:bg-zinc-50"
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

      {isPortal ? (
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
      ) : (
        <p className="text-xs leading-relaxed text-zinc-400">
          Live inventory synced from VNOC managedomain · traffic from
          analytics.vnoc.com · refreshed hourly.
        </p>
      )}

      {/* Sticky mobile apply bar — public: bottom safe-area; portal: above tab bar */}
      <div
        className={
          isPortal
            ? "fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-zinc-200/80 bg-white/95 p-3 backdrop-blur-xl sm:hidden"
            : "fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden"
        }
        role="region"
        aria-label="Apply actions"
      >
        <div className="mx-auto flex max-w-4xl gap-2">
          <Link
            href={applyHref}
            className={
              isPortal
                ? "inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white"
                : "inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[var(--ipp-accent,#8bc53f)] text-sm font-semibold text-[var(--ipp-text,#0f172a)]"
            }
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
    </div>
  );
}
