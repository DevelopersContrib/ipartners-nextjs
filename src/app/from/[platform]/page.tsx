import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  inboundPlatformMeta,
  normalizeInboundRef,
} from "@/lib/inbound-platforms";

type Props = { params: Promise<{ platform: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform } = await params;
  const host = normalizeInboundRef(decodeURIComponent(platform));
  const meta = host ? inboundPlatformMeta(host) : null;
  if (!meta) return { title: "Continue to iPartner" };
  return {
    title: `From ${meta.label} — iPartner`,
    description: `Continue from ${meta.label} into an iPartner sponsorship or equity partnership.`,
    robots: { index: false, follow: true },
  };
}

/**
 * Clean catch URL for partner platforms:
 *   /from/domaindirectory.com  → sets cookie via middleware (?ref=) + welcome CTAs
 */
export default async function FromPlatformPage({ params }: Props) {
  const { platform } = await params;
  const host = normalizeInboundRef(decodeURIComponent(platform));
  if (!host) notFound();
  const meta = inboundPlatformMeta(host);
  if (!meta) notFound();

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
        Catch from {meta.label}
      </p>
      <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ipp-text)] leading-[1.05]">
        Welcome from {meta.label}.
      </h1>
      <p className="mt-4 text-base sm:text-lg text-[var(--ipp-secondary)] leading-relaxed max-w-xl">
        {meta.blurb} You&apos;re on iPartner now — pick how you want to partner
        across the network. Your referral from{" "}
        <span className="font-mono text-[var(--ipp-primary)] ipp-break">{meta.host}</span>{" "}
        stays attached.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Link
          href={`/apply?mode=sponsor&ref=${encodeURIComponent(meta.host)}`}
          className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold w-full sm:w-auto"
        >
          Sponsor a vertical
        </Link>
        <Link
          href={`/apply?ref=${encodeURIComponent(meta.host)}`}
          className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold w-full sm:w-auto"
        >
          Partner on a domain
        </Link>
        <Link
          href={`/match?ref=${encodeURIComponent(meta.host)}`}
          className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border border-[var(--border)] text-[var(--ipp-text)] font-semibold w-full sm:w-auto"
        >
          Free partner match
        </Link>
      </div>

      <p className="mt-8 text-sm text-[var(--ipp-secondary)]">
        Or{" "}
        <Link href={`/verticals?ref=${encodeURIComponent(meta.host)}`} className="font-semibold text-[var(--ipp-accent)] hover:underline">
          browse verticals
        </Link>
        {" · "}
        <a
          href={meta.home}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--ipp-primary)] hover:underline"
        >
          Back to {meta.label}
        </a>
      </p>
    </section>
  );
}
