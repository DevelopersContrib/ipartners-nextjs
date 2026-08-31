"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatBrandValue, formatDomainDisplay } from "@/lib/vertical-brands";
import { searchVerticals } from "@/lib/verticals";

type DomainHit = {
  domainName: string;
  displayName: string;
  partnerScore: number;
  value: number;
  categoryName: string | null;
  verticalName: string;
  href: string;
};

export default function PartnerSearch({
  placeholder = "Search AI, payments, handyman, referrals…",
  autoFocus = false,
}: {
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const verticalResults = useMemo(() => searchVerticals(deferred, 6), [deferred]);
  const [domainResults, setDomainResults] = useState<DomainHit[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const showResults = deferred.trim().length > 0;

  useEffect(() => {
    const q = deferred.trim();
    if (q.length < 2) {
      setDomainResults([]);
      setDomainLoading(false);
      return;
    }

    let cancelled = false;
    setDomainLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/domains/search?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : { domains: [] }))
        .then((data: { domains?: DomainHit[] }) => {
          if (!cancelled) setDomainResults(data.domains ?? []);
        })
        .catch(() => {
          if (!cancelled) setDomainResults([]);
        })
        .finally(() => {
          if (!cancelled) setDomainLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [deferred]);

  const hasResults = verticalResults.length > 0 || domainResults.length > 0;

  return (
    <div className="w-full max-w-xl">
      <label htmlFor="partner-search" className="sr-only">
        Search verticals and domains
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ipp-secondary)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          </svg>
        </span>
        <input
          id="partner-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full min-h-12 pl-12 pr-4 rounded-xl border border-[var(--border)] bg-white text-[var(--ipp-text)] placeholder:text-[var(--ipp-secondary)]/70 shadow-sm focus:outline-none focus:border-[var(--ipp-accent)] focus:ring-2 focus:ring-[var(--ipp-accent)]/20"
        />
      </div>

      {showResults && (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden animate-fade-in-up">
          {!hasResults && !domainLoading ? (
            <p className="px-4 py-4 text-sm text-[var(--ipp-secondary)]">
              No matches. Try another keyword or{" "}
              <Link href="/match" className="text-[var(--ipp-accent)] font-medium hover:underline">
                take the free match
              </Link>
              .
            </p>
          ) : (
            <>
              {domainResults.length > 0 && (
                <section>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ipp-secondary)]">
                    Domains
                  </p>
                  <ul className="divide-y divide-[var(--border)]">
                    {domainResults.map((d) => (
                      <li key={d.domainName} className="hover:bg-[var(--ipp-bg)] transition">
                        <Link href={d.href} className="flex items-start justify-between gap-3 px-4 py-3.5">
                          <div className="min-w-0">
                            <p className="font-mono font-semibold text-[var(--ipp-text)]">
                              {d.displayName || formatDomainDisplay(d.domainName)}
                            </p>
                            <p className="text-sm text-[var(--ipp-secondary)] truncate">
                              {d.verticalName}
                              {d.categoryName ? ` · ${d.categoryName}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums text-[var(--ipp-text)]">
                              {d.partnerScore}
                            </p>
                            <p className="text-xs text-[var(--ipp-secondary)]">
                              {formatBrandValue(d.value)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {domainLoading && domainResults.length === 0 && (
                <p className="px-4 py-3 text-sm text-[var(--ipp-secondary)]">Searching domains…</p>
              )}

              {verticalResults.length > 0 && (
                <section className={domainResults.length > 0 ? "border-t border-[var(--border)]" : ""}>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ipp-secondary)]">
                    Verticals
                  </p>
                  <ul className="divide-y divide-[var(--border)]">
                    {verticalResults.map((v) => (
                      <li key={v.slug} className="hover:bg-[var(--ipp-bg)] transition">
                        <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                          <div className="min-w-0">
                            <Link href={`/verticals/${v.slug}`} className="block">
                              <p className="font-semibold text-[var(--ipp-text)]">{v.name}</p>
                              <p className="text-sm text-[var(--ipp-secondary)] truncate">{v.blurb}</p>
                            </Link>
                          </div>
                          <Link
                            href={`/verticals/${v.slug}`}
                            className="shrink-0 text-sm font-semibold text-[var(--ipp-accent)] pt-0.5"
                          >
                            View
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
