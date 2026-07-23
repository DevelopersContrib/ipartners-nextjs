import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { logout } from "@/lib/auth-actions";
import { MODE_LABELS, statusLabel, type EngagementMode } from "@/lib/engagement-modes";
import DomainReferralLink from "@/components/DomainReferralLink";
import { formatDomainDisplay } from "@/lib/vertical-brands";
import { getTrafficForDomains, formatVisitors } from "@/lib/partner-traffic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — iPartner",
  robots: { index: false },
};

export default async function PortalPage() {
  const partner = await requirePartner();
  const admin = await getAdmin();

  const engagements = await prisma.ippEngagement.findMany({
    where: { email: partner.email },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const active = engagements.filter((e) => e.status === "approved" || e.status === "active").length;
  const pending = engagements.filter((e) => e.status === "pending").length;
  const name = [partner.firstName, partner.lastName].filter(Boolean).join(" ") || partner.email;

  // Live 30-day traffic on the domains they're partnered on — the number that
  // makes the dashboard worth opening. Degrades to nothing on failure.
  const partnerDomains = engagements
    .map((e) => e.scopeValue)
    .filter((v): v is string => !!v && v.includes("."));
  const traffic = await getTrafficForDomains(partnerDomains);
  const reach30d = partnerDomains.reduce(
    (sum, d) => sum + (traffic[d.toLowerCase()]?.visitors30d ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ipp-text)]">Hi, {name}</h1>
            <p className="text-[var(--ipp-secondary)] text-sm mt-1">{partner.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {admin && (
              <Link
                href="/admin"
                className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-[var(--ipp-primary)] underline underline-offset-4"
              >
                Engagement admin
              </Link>
            )}
            <form action={logout}>
              <button className="min-h-11 px-3 text-sm font-medium text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)] underline underline-offset-4">
                Sign out
              </button>
            </form>
          </div>
        </header>

        {engagements.length > 0 && (
        <div className={`grid gap-3 ${reach30d > 0 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--ipp-secondary)]">Active</p>
            <p className="mt-1 text-3xl font-bold text-[var(--ipp-text)]">{active}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--ipp-secondary)]">Under review</p>
            <p className="mt-1 text-3xl font-bold text-[var(--ipp-text)]">{pending}</p>
          </div>
          {reach30d > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 col-span-2 sm:col-span-1">
              <p className="text-xs uppercase tracking-wider text-[var(--ipp-secondary)]">30-day reach</p>
              <p className="mt-1 text-3xl font-bold text-[var(--ipp-text)] tabular-nums">
                {formatVisitors(reach30d)}
              </p>
              <p className="text-[11px] text-[var(--ipp-secondary)] mt-0.5">
                visitors across your domains
              </p>
            </div>
          )}
        </div>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          {engagements.length > 0 && (
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-[var(--ipp-text)]">Your partnerships</h2>
              <span className="text-xs text-[var(--ipp-secondary)]">{engagements.length}</span>
            </div>
          )}

          {engagements.length === 0 ? (
            /* A new partner's first minute inside. Not an empty state — the
               story of what they just joined, and the door to their first
               partnership. */
            <div className="space-y-8">
              <div className="space-y-5 max-w-xl">
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--ipp-accent)]">
                  You&rsquo;re in. Here&rsquo;s what you joined.
                </p>
                <p className="text-lg sm:text-xl leading-relaxed text-[var(--ipp-text)] font-medium">
                  For thirteen years we&rsquo;ve been collecting the names people type —
                  nineteen thousand of them, across 54 categories.
                </p>
                <p className="text-[15px] leading-relaxed text-[var(--ipp-secondary)]">
                  We could have parked them and waited for offers. We made a different bet:
                  <span className="text-[var(--ipp-text)] font-medium"> a great name deserves a great
                  operator more than it deserves a buyer.</span> So instead of selling domains,
                  we hand them to people who can build on them — and we grow together.
                </p>
                <p className="text-[15px] leading-relaxed text-[var(--ipp-secondary)]">
                  81,000 partnerships later, that bet is the network you just signed into.
                  The next one starts here, with you.
                </p>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-semibold text-[var(--ipp-text)] mb-4">
                  Start your first partnership
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Link
                    href="/apply"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--ipp-bg)] p-4 hover:border-[var(--ipp-primary)] transition"
                  >
                    <p className="font-semibold text-[var(--ipp-text)] text-sm">Build on a name</p>
                    <p className="mt-1 text-xs text-[var(--ipp-secondary)] leading-relaxed">
                      Take a domain you believe in and run it. Equity, not rent.
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[var(--ipp-primary)] group-hover:underline underline-offset-2">
                      Choose your domain &rarr;
                    </p>
                  </Link>
                  <Link
                    href="/apply?mode=sponsor"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--ipp-bg)] p-4 hover:border-[var(--ipp-primary)] transition"
                  >
                    <p className="font-semibold text-[var(--ipp-text)] text-sm">Sponsor a category</p>
                    <p className="mt-1 text-xs text-[var(--ipp-secondary)] leading-relaxed">
                      Put your brand across every site in your vertical.
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[var(--ipp-primary)] group-hover:underline underline-offset-2">
                      See the categories &rarr;
                    </p>
                  </Link>
                  <Link
                    href="/domain/apply"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--ipp-bg)] p-4 hover:border-[var(--ipp-primary)] transition"
                  >
                    <p className="font-semibold text-[var(--ipp-text)] text-sm">Bring your domains</p>
                    <p className="mt-1 text-xs text-[var(--ipp-secondary)] leading-relaxed">
                      Own a portfolio? Put it to work inside the network.
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[var(--ipp-primary)] group-hover:underline underline-offset-2">
                      Add your portfolio &rarr;
                    </p>
                  </Link>
                </div>
                <p className="mt-4 text-xs text-[var(--ipp-secondary)]">
                  Every application is read by a person. Approved partnerships go live on the
                  network and appear right here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {engagements.map((e) => (
                <li
                  key={String(e.id)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--ipp-bg)] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                >
                  <span className="text-sm font-semibold text-[var(--ipp-text)]">
                    {MODE_LABELS[e.mode as EngagementMode] || e.mode}
                  </span>
                  {e.scopeValue && (
                    <span className="text-xs font-mono text-[var(--ipp-secondary)]">
                      {e.scopeValue.includes(".") ? (
                        <DomainReferralLink
                          domain={e.scopeValue}
                          className="hover:text-[var(--ipp-accent)] hover:underline underline-offset-2"
                        >
                          {formatDomainDisplay(e.scopeValue)}
                        </DomainReferralLink>
                      ) : (
                        e.scopeValue
                      )}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[var(--border)] text-[var(--ipp-secondary)]">
                    {statusLabel(e.status)}
                  </span>
                  {e.tier && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--ipp-accent)]/15 text-[var(--ipp-text)] capitalize">
                      {e.tier}
                    </span>
                  )}
                  {e.scopeValue && (traffic[e.scopeValue.toLowerCase()]?.visitors30d ?? 0) > 0 && (
                    <span
                      className="ml-auto text-xs text-[var(--ipp-secondary)] tabular-nums"
                      title="Unique visitors, last 30 days"
                    >
                      {formatVisitors(traffic[e.scopeValue.toLowerCase()]!.visitors30d)} visitors / 30d
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--ipp-text)]">
              Know someone who&rsquo;d fit the network?
            </h2>
            <p className="text-sm text-[var(--ipp-secondary)] mt-1">
              Partners make the best referrers — you know what a good fit looks like. Earn when they join.
            </p>
          </div>
          <Link
            href="/referrals"
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-[var(--ipp-primary)] text-white text-sm font-semibold hover:brightness-110 transition"
          >
            Refer a partner
          </Link>
        </section>

        {engagements.length > 0 && (
          <p className="text-center">
            <Link href="/apply" className="text-sm font-semibold text-[var(--ipp-accent)] underline underline-offset-4">
              Start another partnership
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
