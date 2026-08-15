"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rereviewEngagement } from "@/lib/admin-actions";

type Review = {
  verdict: string;
  confidence: number;
  reason: string;
  summary: string[];
  flags: string[];
  layer: string;
  model?: string;
  reviewedAt: string;
};

const VERDICT_STYLES: Record<string, string> = {
  approve: "border-emerald-200 bg-emerald-50 text-emerald-900",
  decline: "border-red-200 bg-red-50 text-red-800",
  needs_info: "border-amber-200 bg-amber-50 text-amber-900",
  review: "border-blue-200 bg-blue-50 text-blue-900",
};

const VERDICT_LABELS: Record<string, string> = {
  approve: "Approve",
  decline: "Decline",
  needs_info: "Needs info",
  review: "Read it",
};

export default function ReviewCard({
  engagementId,
  review,
}: {
  engagementId: string;
  review: Review | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const rerun = () => {
    startTransition(async () => {
      setError(null);
      const res = await rereviewEngagement(engagementId);
      if (!res.ok) setError(res.error || "Re-screen failed");
      else router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ipp-text)]">
            AI pre-screen
          </h2>
          <p className="mt-1 text-xs text-[var(--ipp-secondary)]">
            A recommendation only — approving or declining is still your call.
          </p>
        </div>
        <button
          type="button"
          onClick={rerun}
          disabled={pending}
          className="min-h-9 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--ipp-secondary)] disabled:opacity-40"
        >
          {pending ? "Screening…" : review ? "Re-screen" : "Screen now"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {!review ? (
        <p className="mt-3 text-sm text-[var(--ipp-secondary)]">
          Not screened yet.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              VERDICT_STYLES[review.verdict] || VERDICT_STYLES.review
            }`}
          >
            <strong className="font-semibold">
              {VERDICT_LABELS[review.verdict] || review.verdict}
            </strong>
            {review.confidence > 0 && ` · ${Math.round(review.confidence * 100)}%`}
            {review.reason && ` — ${review.reason}`}
          </p>

          {review.summary.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ipp-text)]">
              {review.summary.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}

          {review.flags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {review.flags.map((f, i) => (
                <li
                  key={i}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] text-[var(--ipp-secondary)]">
            {review.layer === "ai" ? "AI" : "Heuristics"}
            {review.model ? ` · ${review.model}` : ""}
            {review.reviewedAt
              ? ` · ${new Date(review.reviewedAt).toLocaleString("en-US")}`
              : ""}
          </p>
        </div>
      )}
    </section>
  );
}
