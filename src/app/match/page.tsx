import type { Metadata } from "next";
import Link from "next/link";
import MatchQuiz from "@/components/MatchQuiz";

export const metadata: Metadata = {
  title: "Free Partner Match — iPartner",
  description:
    "Answer a few questions and get a free partnership recommendation — sponsor, builder, domain owner, vendor, or referrer — plus matching verticals.",
  openGraph: {
    title: "Free Partner Match — iPartner",
    description: "Find how you should partner across 19,211 domains — free, no account required.",
    type: "website",
    url: "https://ipartner.com/match",
  },
};

export default function MatchPage() {
  return (
    <div className="relative overflow-hidden min-h-[70vh]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 90% 0%, rgba(241,143,1,0.14), transparent), radial-gradient(ellipse 50% 35% at 0% 30%, rgba(71,106,120,0.12), transparent)",
        }}
        aria-hidden
      />
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipp-accent)] animate-fade-in-up">
          iPartner
        </p>
        <h1 className="ipp-loud mt-3 text-4xl sm:text-5xl text-[var(--ipp-text)] animate-fade-in-up-delay-1">
          Free partner match.
        </h1>
        <p className="mt-3 text-[var(--ipp-secondary)] animate-fade-in-up-delay-1">
          Three quick questions. We recommend a partnership mode and verticals — then you apply when ready.
        </p>
        <p className="mt-2 text-sm text-[var(--ipp-secondary)] animate-fade-in-up-delay-1">
          Prefer browsing?{" "}
          <Link href="/verticals" className="font-semibold text-[var(--ipp-accent)] hover:underline">
            Search verticals
          </Link>
        </p>
        <div className="mt-10 animate-fade-in-up-delay-2">
          <MatchQuiz />
        </div>
      </div>
    </div>
  );
}
