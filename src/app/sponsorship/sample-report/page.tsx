import type { Metadata } from "next";
import Link from "next/link";
import { sponsorCheckoutHref } from "@/lib/sponsor-pricing";

export const metadata: Metadata = {
  title: "Sample Silver monthly report · iPartner",
  description:
    "Example layout of a Silver sponsorship monthly report. All figures are sample data — not a live account.",
  robots: { index: false, follow: true },
};

/** Clearly fictional metrics for layout preview only. */
const SAMPLE_SUMMARY = [
  { label: "Visitors", value: "12,480", note: "Sample" },
  { label: "Impressions", value: "48,920", note: "Sample" },
  { label: "Clicks", value: "1,136", note: "Sample" },
  { label: "Top queries", value: "24", note: "Sample" },
] as const;

const SAMPLE_QUERIES = [
  { query: "category brand near me", clicks: 186 },
  { query: "best [vertical] partner", clicks: 142 },
  { query: "[domain] reviews", clicks: 98 },
  { query: "sponsored placement", clicks: 71 },
] as const;

const SAMPLE_PLACEMENTS = [
  { domain: "example-category.com", impressions: 8200, clicks: 210 },
  { domain: "sample-vertical.net", impressions: 6100, clicks: 164 },
  { domain: "demo-premium.org", impressions: 4300, clicks: 121 },
] as const;

export default function SampleSilverReportPage() {
  return (
    <div className="ipp-stack">
      <section className="ipp-band ipp-band-a">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-3 py-2 text-sm text-[var(--ipp-text)]"
            role="status"
          >
            <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--warning)]">
              Sample
            </span>
            <span className="text-[var(--ipp-secondary)]">
              Example data only — not a live sponsorship account.
            </span>
          </div>

          <p className="mt-8 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
            Silver · Monthly report
          </p>
          <h1 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)] text-balance">
            What your report{" "}
            <span className="text-[var(--ipp-accent)]">looks like.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--ipp-secondary)] leading-relaxed text-pretty">
            Silver includes a monthly report: visitors, impressions, clicks, and
            top queries. This page is a labeled sample so you can see the format
            before checkout — every number below is illustrative.
          </p>
        </div>
      </section>

      <section
        className="ipp-band ipp-band-b"
        aria-labelledby="sample-summary-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2
                id="sample-summary-heading"
                className="ipp-loud text-2xl sm:text-3xl text-[var(--ipp-text)]"
              >
                Period summary
              </h2>
              <p className="mt-1 text-sm text-[var(--ipp-secondary)]">
                Example vertical · Sample month 2026-08
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning)]">
              Example figures
            </span>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SAMPLE_SUMMARY.map((item) => (
              <li
                key={item.label}
                className="rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-4 sm:px-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ipp-secondary)]">
                  {item.label}
                  <span className="ms-1.5 text-[var(--warning)]">
                    {item.note}
                  </span>
                </p>
                <p className="ipp-loud mt-2 text-2xl sm:text-3xl text-[var(--ipp-text)] tabular-nums">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="ipp-band ipp-band-c"
        aria-labelledby="sample-queries-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2
            id="sample-queries-heading"
            className="ipp-loud text-2xl sm:text-3xl text-[var(--ipp-text)]"
          >
            Top queries{" "}
            <span className="text-sm font-semibold tracking-normal text-[var(--warning)]">
              (sample)
            </span>
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white/90">
            <table className="w-full min-w-[280px] text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--ipp-secondary)]">
                  <th className="px-4 py-3 font-semibold text-start">Query</th>
                  <th className="px-4 py-3 font-semibold text-end tabular-nums">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_QUERIES.map((row) => (
                  <tr
                    key={row.query}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    <td className="px-4 py-3 text-[var(--ipp-text)]">
                      {row.query}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums text-[var(--ipp-secondary)]">
                      {row.clicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="ipp-band ipp-band-a"
        aria-labelledby="sample-placements-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2
            id="sample-placements-heading"
            className="ipp-loud text-2xl sm:text-3xl text-[var(--ipp-text)]"
          >
            Placement breakdown{" "}
            <span className="text-sm font-semibold tracking-normal text-[var(--warning)]">
              (sample)
            </span>
          </h2>
          <ul className="mt-6 space-y-3">
            {SAMPLE_PLACEMENTS.map((row) => (
              <li
                key={row.domain}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-4 sm:px-5"
              >
                <p className="font-semibold text-[var(--ipp-text)] ipp-break">
                  {row.domain}
                </p>
                <p className="text-sm text-[var(--ipp-secondary)] tabular-nums">
                  {row.impressions.toLocaleString()} impressions ·{" "}
                  {row.clicks.toLocaleString()} clicks
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-[var(--ipp-secondary)] leading-relaxed max-w-2xl text-pretty">
            Live Silver reports use your actual placement data after sponsorship
            is active. Nothing on this page is attributed to a real partner or
            domain.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={sponsorCheckoutHref({ tier: "silver" })}
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold hover:brightness-105 transition w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-primary)]"
            >
              Checkout Silver
            </Link>
            <Link
              href="/apply?mode=sponsor"
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border-2 border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold hover:bg-white/70 transition w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
            >
              Apply as sponsor
            </Link>
            <Link
              href="/#sponsorship"
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl text-[var(--ipp-secondary)] font-semibold hover:text-[var(--ipp-text)] transition w-full sm:w-auto"
            >
              ← Back to tiers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
