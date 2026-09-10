import Link from "next/link";
import Image from "next/image";
import {
  HOW_SPONSORSHIP_WORKS,
  SAMPLE_REPORT_HREF,
  approvedLogos,
  approvedMetrics,
  approvedQuotes,
} from "@/content/marketing-proof";
import { sponsorCheckoutHref } from "@/lib/sponsor-pricing";

/**
 * Homepage marketing proof. Replaces FeaturedReview.
 *
 * Renders only approved logos / quotes / metrics. When none are approved,
 * ships the factual "How sponsorship works" path so we never invent social
 * proof. Empty logo slots are omitted (not placeholders) to avoid CLS.
 */
export default function MarketingProof() {
  const logos = approvedLogos();
  const quotes = approvedQuotes();
  const metrics = approvedMetrics();
  const hasProof = logos.length > 0 || quotes.length > 0 || metrics.length > 0;

  return (
    <section
      className="ipp-band ipp-band-c"
      aria-labelledby="marketing-proof-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          Sponsorship
        </p>
        <h2
          id="marketing-proof-heading"
          className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)] text-balance"
        >
          {hasProof ? (
            <>
              Proof when it’s{" "}
              <span className="text-[var(--ipp-accent)]">cleared.</span>
            </>
          ) : (
            <>
              How sponsorship{" "}
              <span className="text-[var(--ipp-accent)]">works.</span>
            </>
          )}
        </h2>
        <p className="mt-3 max-w-xl text-[var(--ipp-secondary)] text-pretty leading-relaxed">
          {hasProof
            ? "Only logos, quotes, and metrics with written approval appear here."
            : "A clear path from category to live placement — no invented logos, quotes, or ROI."}
        </p>

        {hasProof ? (
          <div className="mt-10 space-y-12">
            {logos.length > 0 && (
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-6">
                {logos.map((logo) => (
                  <li key={logo.id} className="min-h-10 flex items-center">
                    {logo.href ? (
                      <a
                        href={logo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-80 hover:opacity-100 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
                      >
                        <Image
                          src={logo.src}
                          alt={logo.name}
                          width={120}
                          height={40}
                          className="h-8 sm:h-10 w-auto object-contain"
                        />
                      </a>
                    ) : (
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={120}
                        height={40}
                        className="h-8 sm:h-10 w-auto object-contain opacity-80"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {metrics.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {metrics.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-[var(--border)] bg-white/90 px-5 py-4"
                  >
                    <p className="ipp-loud text-2xl sm:text-3xl text-[var(--ipp-text)]">
                      {m.value}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ipp-secondary)]">
                      {m.label}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {quotes.length > 0 &&
              quotes.map((q) => (
                <figure key={q.id} className="max-w-3xl">
                  <div
                    className="text-6xl sm:text-7xl leading-none text-[var(--ipp-accent)] font-bold select-none"
                    aria-hidden
                  >
                    “
                  </div>
                  <blockquote className="ipp-loud -mt-6 sm:-mt-8 text-2xl sm:text-3xl md:text-4xl text-[var(--ipp-text)] leading-[1.2] text-balance">
                    {q.quote}
                  </blockquote>
                  <figcaption className="mt-8">
                    <p className="font-bold text-[var(--ipp-text)]">
                      {q.attribution}
                    </p>
                    <p className="text-sm text-[var(--ipp-secondary)]">
                      {q.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
          </div>
        ) : (
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {HOW_SPONSORSHIP_WORKS.map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-[var(--border)] bg-white/90 p-5 sm:p-6 transition hover:border-[var(--ipp-accent)]/50 hover:bg-white"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipp-accent)]">
                  {step.n}
                </p>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-[var(--ipp-text)] tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--ipp-secondary)] leading-relaxed text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Link
            href={sponsorCheckoutHref({ tier: "silver" })}
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-primary)] text-white text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
          >
            Sponsor checkout
          </Link>
          <Link
            href="/apply?mode=sponsor"
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border-2 border-[var(--ipp-primary)] text-[var(--ipp-primary)] text-sm font-semibold hover:bg-white/70 transition w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
          >
            Apply as sponsor
          </Link>
          <Link
            href={SAMPLE_REPORT_HREF}
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl text-[var(--ipp-secondary)] text-sm font-semibold hover:text-[var(--ipp-text)] transition w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipp-accent)]"
          >
            View sample Silver report →
          </Link>
        </div>
      </div>
    </section>
  );
}
