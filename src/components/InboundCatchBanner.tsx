"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IPP_REF_COOKIE,
  inboundPlatformMeta,
} from "@/lib/inbound-platforms";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

/** Soft banner when the visitor arrived via another network platform. */
export default function InboundCatchBanner() {
  const [host, setHost] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fromCookie = readCookie(IPP_REF_COOKIE);
    if (fromCookie) setHost(fromCookie);
  }, []);

  if (dismissed || !host) return null;
  const meta = inboundPlatformMeta(host);
  if (!meta) return null;

  return (
    <div className="border-b border-[var(--border)] bg-[var(--ipp-accent)]/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
        <p className="flex-1 min-w-0 text-[var(--ipp-text)] leading-snug">
          You arrived from{" "}
          <a
            href={meta.home}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            {meta.label}
          </a>
          . We&apos;ll keep the referral attached.
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href={`/apply?ref=${encodeURIComponent(meta.host)}`}
            className="inline-flex flex-1 sm:flex-none items-center justify-center min-h-10 px-3 rounded-lg bg-[var(--ipp-accent)] text-[var(--ipp-text)] text-xs font-semibold"
          >
            Apply
          </Link>
          <Link
            href={`/match?ref=${encodeURIComponent(meta.host)}`}
            className="inline-flex flex-1 sm:flex-none items-center justify-center min-h-10 px-3 rounded-lg border border-[var(--ipp-primary)] text-[var(--ipp-primary)] text-xs font-semibold"
          >
            Match
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex items-center justify-center min-h-10 min-w-10 text-xs text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)]"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
