"use client";

import { useState, startTransition } from "react";
import Link from "next/link";
import DomainReferralLink from "@/components/DomainReferralLink";
import {
  VERTICALS,
  matchPartner,
  type MatchCommitment,
  type MatchInterest,
  type MatchResult,
} from "@/lib/verticals";

const INTERESTS: { id: MatchInterest; title: string; desc: string }[] = [
  { id: "sponsor", title: "Sponsor a category", desc: "Put my brand next to premium domains" },
  { id: "build", title: "Build with equity", desc: "Help grow a venture and earn upside" },
  { id: "domain", title: "Partner my domain", desc: "I own a name I want to activate" },
  { id: "product", title: "Offer a product/service", desc: "Vend into the network" },
  { id: "refer", title: "Refer & earn", desc: "Send traffic and introductions" },
];

const COMMITMENTS: { id: MatchCommitment; title: string; desc: string }[] = [
  { id: "capital", title: "Capital / brand only", desc: "Sponsorship or light involvement" },
  { id: "few_hours", title: "A few hours a week", desc: "Advisory or side contribution" },
  { id: "part_time", title: "Part-time", desc: "Regular weekly ownership" },
  { id: "full_time", title: "Full-time energy", desc: "Ready to operate day-to-day" },
];

export default function MatchQuiz() {
  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState<MatchInterest | null>(null);
  const [verticalSlugs, setVerticalSlugs] = useState<string[]>([]);
  const [commitment, setCommitment] = useState<MatchCommitment | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  const toggleVertical = (slug: string) => {
    setVerticalSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  };

  const finish = (c: MatchCommitment) => {
    if (!interest) return;
    setCommitment(c);
    startTransition(() => {
      setResult(
        matchPartner({
          interest,
          verticalSlugs,
          commitment: c,
        }),
      );
      setStep(3);
    });
  };

  const reset = () => {
    setStep(0);
    setInterest(null);
    setVerticalSlugs([]);
    setCommitment(null);
    setResult(null);
  };

  const choiceClass = (selected: boolean) =>
    `text-left w-full rounded-xl border p-4 transition ${
      selected
        ? "border-[var(--ipp-accent)] bg-[var(--ipp-accent)]/10"
        : "border-[var(--border)] bg-white hover:border-[var(--ipp-primary)]/30"
    }`;

  if (result && step === 3) {
    return (
      <div className="animate-fade-in-up space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ipp-accent)]">
            Your free match
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--ipp-text)]">
            {result.modeLabel}
          </h2>
          <p className="mt-3 text-[var(--ipp-secondary)] max-w-lg">{result.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ipp-secondary)] mb-3">
            Recommended verticals
          </h3>
          <ul className="space-y-3">
            {result.verticals.map((v) => (
              <li key={v.slug}>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4 hover:border-[var(--ipp-accent)] transition">
                  <Link href={`/verticals/${v.slug}`} className="block">
                    <p className="font-semibold text-[var(--ipp-text)]">{v.name}</p>
                    <p className="mt-1 text-sm text-[var(--ipp-secondary)]">{v.blurb}</p>
                  </Link>
                  <p className="mt-2 text-xs font-mono text-[var(--ipp-primary)]">
                    {v.domains.map((d, i) => (
                      <span key={d}>
                        {i > 0 ? " · " : null}
                        <DomainReferralLink
                          domain={d}
                          className="hover:text-[var(--ipp-accent)] hover:underline underline-offset-2"
                        />
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={result.applyHref}
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] font-semibold hover:brightness-105"
          >
            Apply with this match
          </Link>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-xl border border-[var(--ipp-primary)] text-[var(--ipp-primary)] font-semibold hover:bg-white/70"
          >
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition ${
              step >= i ? "bg-[var(--ipp-accent)]" : "bg-[var(--ipp-primary)]/15"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="animate-fade-in-up space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--ipp-text)]">
            What brings you here?
          </h2>
          <p className="text-sm text-[var(--ipp-secondary)]">Pick the closest fit — free, no account.</p>
          <div className="grid gap-3">
            {INTERESTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={choiceClass(interest === item.id)}
                onClick={() => {
                  setInterest(item.id);
                  setStep(1);
                }}
              >
                <span className="font-semibold text-[var(--ipp-text)]">{item.title}</span>
                <span className="block text-sm text-[var(--ipp-secondary)] mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in-up space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--ipp-text)]">
            Which verticals interest you?
          </h2>
          <p className="text-sm text-[var(--ipp-secondary)]">Choose up to three — or skip.</p>
          <div className="grid sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {VERTICALS.map((v) => {
              const selected = verticalSlugs.includes(v.slug);
              return (
                <button
                  key={v.slug}
                  type="button"
                  className={choiceClass(selected)}
                  onClick={() => toggleVertical(v.slug)}
                >
                  <span className="font-semibold text-[var(--ipp-text)]">{v.name}</span>
                  <span className="block text-xs text-[var(--ipp-secondary)] mt-0.5 line-clamp-2">
                    {v.blurb}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 min-h-12 rounded-xl border border-[var(--border)] font-semibold text-[var(--ipp-text)]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 min-h-12 rounded-xl bg-[var(--ipp-accent)] font-semibold text-[var(--ipp-text)]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--ipp-text)]">
            How involved can you be?
          </h2>
          <p className="text-sm text-[var(--ipp-secondary)]">This shapes builder vs operator vs sponsor.</p>
          <div className="grid gap-3">
            {COMMITMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={choiceClass(commitment === item.id)}
                onClick={() => finish(item.id)}
              >
                <span className="font-semibold text-[var(--ipp-text)]">{item.title}</span>
                <span className="block text-sm text-[var(--ipp-secondary)] mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full min-h-12 rounded-xl border border-[var(--border)] font-semibold text-[var(--ipp-text)]"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
