import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import DomainReferralLink from "@/components/DomainReferralLink";
import {
  domainPageHref,
  formatBrandStat,
  formatBrandValue,
  formatDomainDisplay,
  getVerticalBrandsByValue,
  VERTICAL_BRANDS_LIMIT,
} from "@/lib/vertical-brands";
import {
  getAllVerticalSlugs,
  getVertical,
  VERTICALS,
} from "@/lib/verticals";

type Props = { params: Promise<{ slug: string }> };

/** Inventory + TV come from live managedomain — refresh hourly. */
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllVerticalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) return { title: "Vertical — iPartner" };
  return {
    title: `${v.name} Partnerships — iPartner`,
    description: v.blurb,
    keywords: v.keywords.join(", "),
    openGraph: {
      title: `${v.name} — Partner with iPartner`,
      description: v.blurb,
      type: "article",
      url: `https://ipartner.com/verticals/${v.slug}`,
      images: [{ url: v.image.src, alt: v.image.alt }],
    },
  };
}

export default async function VerticalDetailPage({ params }: Props) {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) notFound();

  const related = VERTICALS.filter((x) => x.slug !== v.slug).slice(0, 3);
  const { brands: topBrands, total } = await getVerticalBrandsByValue(
    v.slug,
    VERTICAL_BRANDS_LIMIT,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${v.name} Partnerships`,
    description: v.blurb,
    url: `https://ipartner.com/verticals/${v.slug}`,
    isPartOf: { "@type": "WebSite", name: "iPartner", url: "https://ipartner.com" },
    about: topBrands.map((b) => ({ "@type": "Thing", name: b.domainName })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Full-bleed hero — brand + headline + sentence + CTAs + dominant image */}
      <section className="relative min-h-[72vh] sm:min-h-[78vh] flex items-end overflow-hidden">
        <Image
          src={v.image.src}
          alt={v.image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,29,47,0.35) 0%, rgba(3,29,47,0.55) 45%, rgba(3,29,47,0.88) 100%)",
          }}
        />
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-28">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)] animate-fade-in-up">
            iPartner · {v.name}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] animate-fade-in-up-delay-1">
            {v.name}
          </h1>
          <p className="mt-4 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed animate-fade-in-up-delay-1">
            {v.blurb}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-2 w-full max-w-lg">
            <Link
              href={`/apply?mode=sponsor&vertical=${encodeURIComponent(v.slug)}`}
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold hover:brightness-105 w-full sm:w-auto"
            >
              Sponsor this vertical
            </Link>
            <Link
              href={`/apply?mode=builder&vertical=${encodeURIComponent(v.slug)}`}
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border border-white/50 text-white font-semibold hover:bg-white/10 w-full sm:w-auto"
            >
              Partner to build
            </Link>
          </div>
          <p className="mt-6 text-[11px] text-white/55">
            Photo by{" "}
            <a
              href={v.image.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white/80"
            >
              {v.image.photographer}
            </a>{" "}
            on{" "}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white/80"
            >
              Pexels
            </a>
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ipp-text)]">The story</h2>
        <p className="mt-5 text-[var(--ipp-secondary)] text-base sm:text-lg leading-relaxed whitespace-pre-line">
          {v.story}
        </p>
      </section>

      {topBrands.length > 0 && (
        <section className="border-y border-[var(--border)] bg-white/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ipp-text)]">
              Top brands to partner
            </h2>
            <p className="mt-2 text-[var(--ipp-secondary)] max-w-2xl">
              Top {topBrands.length} names
              {total > topBrands.length
                ? ` from ${total.toLocaleString()} active`
                : ""}
              , ranked by PartnerScore — traffic, network, demand, and asset value.
              Use the score to decide where you qualify.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {topBrands.map((b, i) => (
                <li key={b.domainName} className="min-w-0">
                  <article className="h-full rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <DomainReferralLink
                        domain={b.domainName}
                        className="shrink-0 rounded-lg hover:opacity-90 transition"
                      >
                        <BrandLogo domain={b.domainName} size={48} />
                      </DomainReferralLink>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ipp-secondary)]">
                            #{i + 1}
                          </p>
                          <p
                            className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-[var(--ipp-text)] bg-[var(--ipp-accent)]/25"
                            title={b.partnerLabel}
                          >
                            {b.partnerScore}
                          </p>
                        </div>
                        <h3 className="mt-0.5 font-mono text-sm sm:text-base font-semibold min-w-0">
                          <Link
                            href={domainPageHref(b.domainName)}
                            className="block truncate text-[var(--ipp-primary)] hover:text-[var(--ipp-accent)] hover:underline underline-offset-2"
                          >
                            {formatDomainDisplay(b.domainName)}
                          </Link>
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-[var(--ipp-secondary)] line-clamp-2">
                          {b.partnerLabel}
                        </p>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          UV 7d
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.uniqueVisitors7d)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          UV 30d
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.uniqueVisitors30d)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          PV 7d
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.pageviews7d)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          PV 30d
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.pageviews30d)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          TV
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandValue(b.value)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          Partners
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.partners)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          Leads
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.leads)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[var(--ipp-secondary)]">
                          Offers
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--ipp-text)]">
                          {formatBrandStat(b.offers)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/apply?mode=sponsor&vertical=${encodeURIComponent(v.slug)}`}
                className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold w-full sm:w-auto"
              >
                I&apos;m interested in sponsoring
              </Link>
              <Link
                href="/match"
                className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold w-full sm:w-auto"
              >
                Free partner match
              </Link>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <h2 className="text-xl font-bold text-[var(--ipp-text)]">Explore more verticals</h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/verticals/${r.slug}`}
                  className="block rounded-xl border border-[var(--border)] bg-white p-4 hover:border-[var(--ipp-accent)] transition"
                >
                  <p className="font-semibold text-[var(--ipp-text)]">{r.name}</p>
                  <p className="mt-1 text-sm text-[var(--ipp-secondary)] line-clamp-2">{r.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href="/verticals" className="text-sm font-semibold text-[var(--ipp-accent)] hover:underline">
              All verticals →
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
