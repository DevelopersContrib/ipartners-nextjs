import Link from "next/link";
import DomainReferralLink from "@/components/DomainReferralLink";
import VerticalIcon from "@/components/VerticalIcon";
import type { Vertical } from "@/lib/verticals";

/** Clickable icon category cards — each opens the vertical SEO page. */
export default function CategoryCards({
  verticals,
  showDomains = true,
}: {
  verticals: Pick<Vertical, "slug" | "name" | "blurb" | "domains">[];
  showDomains?: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {verticals.map((v) => (
        <li key={v.slug}>
          <div className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 transition duration-200 hover:border-[var(--ipp-accent)] hover:shadow-sm">
            <Link
              href={`/verticals/${v.slug}`}
              className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipp-accent)] rounded-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ipp-bg)] text-[var(--ipp-primary)] transition group-hover:bg-[var(--ipp-accent)]/15 group-hover:text-[var(--ipp-accent)]">
                  <VerticalIcon slug={v.slug} />
                </span>
                <span className="text-sm font-semibold text-[var(--ipp-accent)] opacity-0 translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0">
                  Open →
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--ipp-text)] tracking-tight group-hover:text-[var(--ipp-primary)]">
                {v.name}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--ipp-secondary)] leading-relaxed flex-1">
                {v.blurb}
              </p>
            </Link>
            {showDomains && (
              <p className="mt-4 text-xs font-mono text-[var(--ipp-primary)]/80 truncate">
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
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
