"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import DomainReferralLink from "@/components/DomainReferralLink";
import { searchVerticals } from "@/lib/verticals";

export default function PartnerSearch({
  placeholder = "Search AI, payments, handyman, referrals…",
  autoFocus = false,
}: {
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = useMemo(() => searchVerticals(deferred, 8), [deferred]);
  const showResults = deferred.trim().length > 0;

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
        <ul className="mt-3 rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden divide-y divide-[var(--border)] animate-fade-in-up">
          {results.length === 0 ? (
            <li className="px-4 py-4 text-sm text-[var(--ipp-secondary)]">
              No matches. Try another keyword or{" "}
              <Link href="/match" className="text-[var(--ipp-accent)] font-medium hover:underline">
                take the free match
              </Link>
              .
            </li>
          ) : (
            results.map((v) => (
              <li key={v.slug} className="hover:bg-[var(--ipp-bg)] transition">
                <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <Link href={`/verticals/${v.slug}`} className="block">
                      <p className="font-semibold text-[var(--ipp-text)]">{v.name}</p>
                      <p className="text-sm text-[var(--ipp-secondary)] truncate">{v.blurb}</p>
                    </Link>
                    <p className="mt-1 text-xs font-mono text-[var(--ipp-primary)]/80 truncate">
                      {v.domains.slice(0, 3).map((d, i) => (
                        <span key={d}>
                          {i > 0 ? " · " : null}
                          <DomainReferralLink
                            domain={d}
                            className="hover:text-[var(--ipp-accent)] hover:underline underline-offset-2"
                          />
                        </span>
                      ))}
                    </p>
                  </div>
                  <Link
                    href={`/verticals/${v.slug}`}
                    className="shrink-0 text-sm font-semibold text-[var(--ipp-accent)] pt-0.5"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
