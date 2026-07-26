import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODE_LABELS, statusLabel, type EngagementMode } from "@/lib/engagement-modes";
import { logout } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile — iPartner",
  robots: { index: false },
};

export default async function ProfilePage() {
  const partner = await requirePartner("/portal/profile");
  const name =
    [partner.firstName, partner.lastName].filter(Boolean).join(" ") || "Partner";

  const engagements = await prisma.ippEngagement.findMany({
    where: { email: partner.email },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const closed = engagements.filter(
    (e) => e.status === "approved" || e.status === "active",
  ).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
      <header className="space-y-1">
        <h1 className="break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {name}
        </h1>
        <p className="break-all text-sm text-zinc-500">{partner.email}</p>
        {partner.company && (
          <p className="text-sm text-zinc-600">{partner.company}</p>
        )}
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Partnerships</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {engagements.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Active / approved</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{closed}</p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Current partnerships</h2>
        {engagements.length === 0 ? (
          <p className="text-sm text-zinc-500">
            None yet.{" "}
            <Link href="/portal/discover" className="underline underline-offset-2">
              Discover opportunities
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {engagements.map((e) => (
              <li
                key={String(e.id)}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
              >
                <span className="text-sm font-medium text-zinc-900">
                  {MODE_LABELS[e.mode as EngagementMode] || e.mode}
                </span>
                {e.scopeValue && (
                  <span className="truncate font-mono text-xs text-zinc-500">
                    {e.scopeValue}
                  </span>
                )}
                <span className="text-xs text-zinc-400 sm:ml-auto">
                  {statusLabel(e.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-1 rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-4 sm:p-5">
        <p className="text-sm font-medium text-zinc-800">Reviews &amp; verification</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          PartnerScore on opportunities uses network traffic and demand. Personal verification
          badges and peer reviews come in a later phase.
        </p>
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:font-medium sm:text-zinc-500 sm:underline sm:underline-offset-2 sm:hover:bg-transparent sm:hover:text-zinc-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
