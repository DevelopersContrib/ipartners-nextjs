import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Match or search",
    body: "Take the free match — or search a vertical and open the category you want to own.",
    href: "/match",
    cta: "Free match",
  },
  {
    n: "02",
    title: "Pick your mode",
    body: "Sponsor, builder, domain owner, referrer, vendor, or operator — one identity, many engagements.",
    href: "/apply",
    cta: "See modes",
  },
  {
    n: "03",
    title: "Apply in minutes",
    body: "Tell us the vertical or domain. We record the engagement and route it for review.",
    href: "/apply",
    cta: "Apply now",
  },
  {
    n: "04",
    title: "One review. Go live.",
    body: "Our team reviews fit — then you land in the portal with every engagement in one place.",
    href: "/login",
    cta: "Sign in",
  },
];

export default function HowItWorks() {
  return (
    <section className="ipp-band ipp-band-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)]">
          The path
        </p>
        <h2 className="ipp-loud mt-3 text-3xl sm:text-5xl text-[var(--ipp-text)]">
          Four steps.{" "}
          <span className="text-[var(--ipp-accent)]">One review.</span>
        </h2>
        <p className="mt-3 max-w-xl text-[var(--ipp-secondary)]">
          No maze of forms. A short path from curiosity to a live partnership engagement.
        </p>

        <ol className="relative mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {/* Connector line — desktop */}
          <div
            className="pointer-events-none absolute top-[2.25rem] left-[12%] right-[12%] hidden lg:block h-0.5 bg-gradient-to-r from-[var(--ipp-accent)]/20 via-[var(--ipp-accent)] to-[var(--ipp-accent)]/20"
            aria-hidden
          />

          {STEPS.map((step, i) => (
            <li
              key={step.n}
              className="relative group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ipp-bg)] border border-[var(--border)] text-[var(--ipp-accent)] font-bold text-lg shadow-sm transition group-hover:bg-[var(--ipp-accent)] group-hover:text-[var(--ipp-text)] group-hover:border-[var(--ipp-accent)]">
                {step.n}
              </div>
              <h3 className="mt-5 text-xl font-bold text-[var(--ipp-text)] tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--ipp-secondary)] leading-relaxed">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--ipp-accent)] hover:underline underline-offset-4"
              >
                {step.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
