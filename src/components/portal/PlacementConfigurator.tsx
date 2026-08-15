"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SPONSOR_SCOPES,
  SPONSOR_SCOPE_HINTS,
  SPONSOR_SCOPE_LABELS,
  SPONSOR_TIER_DETAILS,
  formatSponsorPrice,
  sponsorCheckoutHref,
  type SponsorScope,
} from "@/lib/sponsor-pricing";

export type PlacementCategory = {
  slug: string;
  name: string;
  blurb: string;
  domains: string[];
};

export default function PlacementConfigurator({
  categories,
}: {
  categories: PlacementCategory[];
}) {
  const [scope, setScope] = useState<SponsorScope>("vertical");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [domain, setDomain] = useState(categories[0]?.domains[0] ?? "");

  const category = useMemo(
    () => categories.find((c) => c.slug === categorySlug) ?? categories[0],
    [categories, categorySlug],
  );

  const domainOptions = category?.domains ?? [];
  const activeDomain =
    scope === "domain"
      ? domainOptions.includes(domain)
        ? domain
        : domainOptions[0] || ""
      : "";

  const onCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const next = categories.find((c) => c.slug === slug);
    setDomain(next?.domains[0] ?? "");
  };

  const scopeReady = scope === "vertical" ? Boolean(category) : Boolean(activeDomain);
  const placementLabel =
    scope === "domain" ? activeDomain || "a domain" : category?.name || "a category";

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            1 · Where should it run?
          </h2>
          <p className="text-xs text-zinc-400">Required before checkout</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SPONSOR_SCOPES.map((s) => {
            const active = scope === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setScope(s)}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900/[0.03]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="block text-sm font-semibold text-zinc-900">
                  {SPONSOR_SCOPE_LABELS[s]}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                  {SPONSOR_SCOPE_HINTS[s]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="placement-category"
              className="block text-xs font-medium text-zinc-600"
            >
              Category
            </label>
            <select
              id="placement-category"
              value={category?.slug ?? ""}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.04]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            {category && (
              <p className="text-xs leading-relaxed text-zinc-500">{category.blurb}</p>
            )}
          </div>

          {scope === "domain" && (
            <div className="space-y-1.5">
              <label
                htmlFor="placement-domain"
                className="block text-xs font-medium text-zinc-600"
              >
                Domain in {category?.name}
              </label>
              {domainOptions.length > 0 ? (
                <select
                  id="placement-domain"
                  value={activeDomain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.04]"
                >
                  {domainOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500">
                  No flagship domain listed for this category yet — browse{" "}
                  <Link
                    href={`/portal/discover?vertical=${encodeURIComponent(category?.slug ?? "")}`}
                    className="underline underline-offset-2"
                  >
                    Discover
                  </Link>{" "}
                  or pick a whole category.
                </p>
              )}
              <p className="text-xs leading-relaxed text-zinc-500">
                Want a name that is not listed?{" "}
                <Link
                  href={`/portal/discover?vertical=${encodeURIComponent(category?.slug ?? "")}`}
                  className="underline underline-offset-2"
                >
                  Find it in Discover
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">2 · Pick a tier</h2>
          <p className="text-xs text-zinc-500">
            Placement: <span className="font-medium text-zinc-700">{placementLabel}</span>
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {SPONSOR_TIER_DETAILS.map((t) => (
            <li
              key={t.tier}
              className={`flex flex-col rounded-2xl border bg-white p-4 sm:p-5 ${
                t.recommended
                  ? "border-zinc-900 ring-1 ring-zinc-900/10"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">{t.label}</p>
                {t.recommended && (
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Most picked
                  </span>
                )}
              </div>

              <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                {formatSponsorPrice(t.tier)}
                <span className="ml-1 text-xs font-medium text-zinc-500">/ year</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{t.tagline}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {t.features[scope].map((f) => (
                  <li key={f} className="flex gap-2 text-xs leading-relaxed text-zinc-600">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[11px] uppercase tracking-wide text-zinc-400">
                {t.reporting}
              </p>

              {scopeReady ? (
                <Link
                  href={sponsorCheckoutHref({
                    tier: t.tier,
                    vertical: category?.slug,
                    domain: scope === "domain" ? activeDomain : null,
                  })}
                  className={`mt-3 inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                    t.recommended
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-white"
                  }`}
                >
                  Checkout {t.label}
                </Link>
              ) : (
                <span className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-dashed border-zinc-200 px-4 text-xs text-zinc-400">
                  Choose a domain first
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-zinc-500">
        Prices are annual and identical for both placement types — scope changes where the
        sponsorship runs, not the price. Card or crypto via PayDirect; your engagement is
        approved when payment settles. Need homepage hero, newsletter, or podcast
        packages?{" "}
        <Link
          href={`/apply?mode=sponsor&vertical=${encodeURIComponent(category?.slug ?? "")}`}
          className="underline underline-offset-2"
        >
          Ask us for a custom quote
        </Link>
        .
      </p>
    </div>
  );
}
