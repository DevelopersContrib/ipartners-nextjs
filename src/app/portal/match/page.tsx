import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { requirePartner } from "@/lib/auth";
import {
  MATCH_COOKIE,
  parseMatchIntent,
  matchDiscoverHref,
  matchApplyHref,
} from "@/lib/match-intent";
import { MODE_LABELS, type EngagementMode } from "@/lib/engagement-modes";
import { getVertical } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Matchmaker — iPartner",
  robots: { index: false },
};

export default async function PortalMatchPage() {
  await requirePartner("/portal/match");
  const jar = await cookies();
  const intent = parseMatchIntent(jar.get(MATCH_COOKIE)?.value);

  const verticalNames =
    intent?.verticals
      .map((s) => getVertical(s)?.name)
      .filter((n): n is string => !!n) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          AI Matchmaker
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          Answer a few questions and we&apos;ll point you at verticals and modes that fit —
          then jump into Discover to apply.
        </p>
      </header>

      {intent ? (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Saved match
          </p>
          <p className="text-lg font-semibold text-zinc-900">
            {MODE_LABELS[intent.mode as EngagementMode] || intent.mode}
          </p>
          {verticalNames.length > 0 && (
            <p className="text-sm text-zinc-500">
              Verticals: {verticalNames.join(" · ")}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href={matchDiscoverHref(intent)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto"
            >
              Open Discover (pre-filtered)
            </Link>
            <Link
              href={matchApplyHref(intent)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto"
            >
              Apply to top match
            </Link>
            <Link
              href="/match"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto"
            >
              Retake quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
          <p className="text-sm text-zinc-600">
            The free match quiz is live on the marketing site. After you finish, we save your
            intent and bring you back here with Discover pre-filtered.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href="/match"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto"
            >
              Take the match quiz
            </Link>
            <Link
              href="/portal/discover"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto"
            >
              Browse Discover
            </Link>
          </div>
        </div>
      )}

      <ul className="space-y-1.5 text-xs text-zinc-400">
        <li>Try: Find SaaS brands needing distribution</li>
        <li>Try: Sites selling homepage placements</li>
        <li>Try: AI startups looking for operators</li>
      </ul>
    </div>
  );
}
