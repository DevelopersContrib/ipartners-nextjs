import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your partnerships — iPartners",
  robots: { index: false },
};

/** Applications this email has submitted, across all five intake tables. */
async function loadApplications(email: string) {
  const [general, appLeader, domain, product, venture] = await Promise.all([
    prisma.iPartner.findMany({
      where: { email },
      select: { ipartner_id: true, domain_name: true, status: true, date_submitted: true },
      orderBy: { date_submitted: "desc" },
    }),
    prisma.iPartner_AppLeader.findMany({
      where: { email },
      select: { ipartner_id: true, domain: true, app_status: true, date_submitted: true },
    }),
    prisma.iPartner_Domain.findMany({
      where: { email },
      select: { ipartner_domain_id: true, domain: true, status: true, date_submitted: true },
    }),
    prisma.iPartner_ProductService.findMany({
      where: { email },
      select: { ipartner_id: true, domain: true, app_status: true, date_submitted: true },
    }),
    prisma.iPartner_VentureLeader.findMany({
      where: { email },
      select: { ipartner_id: true, domain: true, app_status: true, date_submitted: true },
    }),
  ]);

  // status on IPartner is a tinyint: 0 = pending review, 1/2 = actioned.
  const generalStatus = (s: number | null) =>
    s === 1 ? "Added to VNOC" : s === 2 ? "Added to team" : "Under review";

  return [
    ...general.map((r) => ({
      key: `general-${r.ipartner_id}`,
      track: "General partnership",
      domain: r.domain_name,
      status: generalStatus(r.status),
      date: r.date_submitted,
    })),
    ...appLeader.map((r) => ({
      key: `app-${r.ipartner_id}`,
      track: "App partnership",
      domain: r.domain,
      status: r.app_status || "Under review",
      date: r.date_submitted,
    })),
    ...domain.map((r) => ({
      key: `domain-${r.ipartner_domain_id}`,
      track: "Domain partnership",
      domain: r.domain,
      status: r.status || "Under review",
      date: r.date_submitted,
    })),
    ...product.map((r) => ({
      key: `product-${r.ipartner_id}`,
      track: "Product / service",
      domain: r.domain,
      status: r.app_status || "Under review",
      date: r.date_submitted,
    })),
    ...venture.map((r) => ({
      key: `venture-${r.ipartner_id}`,
      track: "Venture leader",
      domain: r.domain,
      status: r.app_status || "Under review",
      date: r.date_submitted,
    })),
  ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}

const card = "bg-[#111916] border border-[#1E2D25] rounded-2xl";

export default async function PortalPage() {
  const partner = await requirePartner();

  const [applications, partnerships] = await Promise.all([
    loadApplications(partner.email),
    partner.memberId
      ? prisma.marketPartnership.findMany({
          where: { member_id: BigInt(partner.memberId) },
          select: {
            partner_id: true,
            domain: true,
            company_name: true,
            type: true,
            approved: true,
            in_equity: true,
            date_applied: true,
          },
          orderBy: { date_applied: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  const name = [partner.firstName, partner.lastName].filter(Boolean).join(" ") || partner.email;

  return (
    <main className="min-h-screen bg-[#0A0F0D] px-4 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {name}</h1>
            <p className="text-[#5A6E62] text-sm mt-1">
              {partner.email}
              {partner.company ? ` · ${partner.company}` : ""}
            </p>
          </div>
          <form action={logout}>
            <button className="text-sm text-[#8B9E93] hover:text-white transition-colors underline underline-offset-4">
              Sign out
            </button>
          </form>
        </header>

        {/* Published partnerships */}
        <section className={card}>
          <div className="p-6 sm:p-7">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-white">Your partnerships</h2>
              <span className="text-xs text-[#5A6E62]">{partnerships.length}</span>
            </div>
            {partnerships.length === 0 ? (
              <p className="text-[#5A6E62] text-sm">
                No published partnerships yet. Once an application is approved it appears here — and
                your link goes live on the domain.
              </p>
            ) : (
              <ul className="divide-y divide-[#1E2D25]">
                {partnerships.map((p) => (
                  <li key={p.partner_id} className="py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-white font-mono text-sm">{p.domain}</span>
                    {p.type && <span className="text-xs text-[#5A6E62]">{p.type}</span>}
                    {p.approved === 1 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                        live
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A2420] text-[#8B9E93]">
                        pending
                      </span>
                    )}
                    {p.in_equity === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A2420] text-[#8B9E93]">
                        equity
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Applications */}
        <section className={card}>
          <div className="p-6 sm:p-7">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-white">Your applications</h2>
              <span className="text-xs text-[#5A6E62]">{applications.length}</span>
            </div>
            {applications.length === 0 ? (
              <div className="text-sm">
                <p className="text-[#5A6E62] mb-3">No applications under this email yet.</p>
                <Link
                  href="/apply"
                  className="inline-block px-4 py-2.5 rounded-xl bg-white text-[#0A0F0D] font-semibold"
                >
                  Apply for a partnership
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#1E2D25]">
                {applications.map((a) => (
                  <li key={a.key} className="py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-white text-sm">{a.track}</span>
                    {a.domain && (
                      <span className="text-[#8B9E93] font-mono text-xs">{a.domain}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A2420] text-[#8B9E93]">
                      {a.status}
                    </span>
                    {a.date && (
                      <span className="text-xs text-[#5A6E62] ml-auto">
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-[#5A6E62]">
          Browsing domains to partner on is coming next.{" "}
          <Link href="/domain" className="underline underline-offset-4">
            See domain partnerships
          </Link>
        </p>
      </div>
    </main>
  );
}
