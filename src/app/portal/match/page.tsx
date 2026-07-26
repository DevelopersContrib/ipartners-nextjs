import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Matchmaker — iPartner",
  robots: { index: false },
};

export default async function PortalMatchPage() {
  await requirePartner("/portal/match");

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

      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-zinc-600">
          The free match quiz is live on the marketing site. Conversational prompts (ROI
          estimates, outreach drafts) come next.
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

      <ul className="space-y-1.5 text-xs text-zinc-400">
        <li>Try: Find SaaS brands needing distribution</li>
        <li>Try: Sites selling homepage placements</li>
        <li>Try: AI startups looking for operators</li>
      </ul>
    </div>
  );
}
