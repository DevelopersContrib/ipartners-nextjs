import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { VERTICALS } from "@/lib/verticals";
import { ENGAGEMENT_MODES, MODE_LABELS } from "@/lib/engagement-modes";
import { getDiscoverOpportunities } from "@/lib/portal-opportunities";
import OpportunityCardView from "@/components/portal/OpportunityCardView";
import FilterChips from "@/components/portal/FilterChips";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover — iPartner",
  robots: { index: false },
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vertical?: string; mode?: string }>;
}) {
  await requirePartner("/portal/discover");
  const params = await searchParams;
  const q = (params.q || "").trim();
  const vertical = params.vertical && VERTICALS.some((v) => v.slug === params.vertical)
    ? params.vertical
    : undefined;
  const mode = params.mode && (ENGAGEMENT_MODES as readonly string[]).includes(params.mode)
    ? params.mode
    : undefined;

  const opportunities = await getDiscoverOpportunities({
    limit: 36,
    verticalSlug: vertical,
    q,
  });

  const filterHref = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q, vertical, mode, ...next };
    if (merged.q) sp.set("q", merged.q);
    if (merged.vertical) sp.set("vertical", merged.vertical);
    if (merged.mode) sp.set("mode", merged.mode);
    const s = sp.toString();
    return s ? `/portal/discover?${s}` : "/portal/discover";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <header className="space-y-1.5 sm:space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          Discover
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Partnership opportunities across the network — filter by vertical or mode, then apply.
        </p>
        {(mode || vertical) && (
          <p className="text-xs text-zinc-500">
            Showing
            {mode ? (
              <>
                {" "}
                <span className="font-medium text-zinc-700">
                  {MODE_LABELS[mode as keyof typeof MODE_LABELS] || mode}
                </span>{" "}
                interest
              </>
            ) : null}
            {vertical ? (
              <>
                {" "}
                in{" "}
                <span className="font-medium text-zinc-700">
                  {VERTICALS.find((v) => v.slug === vertical)?.name || vertical}
                </span>
              </>
            ) : null}
            .{" "}
            <Link href="/portal/discover" className="underline underline-offset-2">
              Clear filters
            </Link>
          </p>
        )}
      </header>

      <form action="/portal/discover" className="sm:hidden">
        <label className="sr-only" htmlFor="discover-q">
          Search
        </label>
        <input
          id="discover-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search companies, domains…"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.04]"
        />
        {vertical && <input type="hidden" name="vertical" value={vertical} />}
        {mode && <input type="hidden" name="mode" value={mode} />}
      </form>

      <div className="space-y-3">
        <FilterChips
          items={[
            {
              href: filterHref({ vertical: undefined }),
              label: "All verticals",
              active: !vertical,
            },
            ...VERTICALS.map((v) => ({
              href: filterHref({ vertical: v.slug }),
              label: v.name,
              active: vertical === v.slug,
            })),
          ]}
        />
        <FilterChips
          items={[
            {
              href: filterHref({ mode: undefined }),
              label: "All modes",
              active: !mode,
              strong: false,
            },
            ...ENGAGEMENT_MODES.map((m) => ({
              href: filterHref({ mode: m }),
              label: MODE_LABELS[m],
              active: mode === m,
              strong: false,
            })),
          ]}
        />
      </div>

      {mode && (
        <p className="text-xs leading-relaxed text-zinc-500">
          Mode filter highlights interest — apply with{" "}
          <Link className="underline underline-offset-2" href={`/apply?mode=${mode}`}>
            {MODE_LABELS[mode as keyof typeof MODE_LABELS]}
          </Link>{" "}
          selected.
        </p>
      )}

      {q && (
        <p className="text-xs text-zinc-500">
          {opportunities.length > 0
            ? `${opportunities.length} result${opportunities.length === 1 ? "" : "s"} for “${q}”`
            : `No results for “${q}”`}
          .{" "}
          <Link href={filterHref({ q: undefined })} className="underline underline-offset-2">
            Clear search
          </Link>
        </p>
      )}

      {opportunities.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          Nothing matched these filters. Try another vertical or clear search.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {opportunities.map((o) => (
            <li key={o.domainName}>
              <OpportunityCardView opportunity={o} mode={mode} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
