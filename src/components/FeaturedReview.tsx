import Link from "next/link";

/**
 * Single featured review — editorial pull-quote, not a wall of fake testimonials.
 */
export default function FeaturedReview() {
  return (
    <section className="ipp-band ipp-band-c">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          From the network
        </p>
        <h2 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)]">
          One review.
        </h2>

        <figure className="mt-10 max-w-3xl">
          <div className="text-6xl sm:text-7xl leading-none text-[var(--ipp-accent)] font-bold select-none" aria-hidden>
            “
          </div>
          <blockquote className="ipp-loud -mt-6 sm:-mt-8 text-2xl sm:text-3xl md:text-4xl text-[var(--ipp-text)] leading-[1.2]">
            Sitting next to the category name changes everything. Traffic already knows where to type —
            we just had to show up and build.
          </blockquote>
          <figcaption className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-bold text-lg">
              JP
            </div>
            <div>
              <p className="font-bold text-[var(--ipp-text)]">Jordan P.</p>
              <p className="text-sm text-[var(--ipp-secondary)]">
                Builder · category brand partnership
              </p>
            </div>
            <Link
              href="/apply"
              className="sm:ml-auto inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-[var(--ipp-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Start your application
            </Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
