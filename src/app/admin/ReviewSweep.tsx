"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runReviewSweep } from "@/lib/admin-actions";

export default function ReviewSweep({
  aiConfigured,
  unreviewedCount,
}: {
  aiConfigured: boolean;
  unreviewedCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (force: boolean) => {
    startTransition(async () => {
      setMessage(null);
      const res = await runReviewSweep({ limit: 25, force });
      if (!res.ok) {
        setMessage(res.error || "Pre-screen failed");
        return;
      }
      const v = res.byVerdict || {};
      setMessage(
        res.reviewed === 0
          ? "Nothing left to screen on the pending queue."
          : `Screened ${res.reviewed} — approve ${v.approve ?? 0}, needs info ${v.needs_info ?? 0}, read it ${v.review ?? 0}, decline ${v.decline ?? 0}${
              res.failed ? ` · ${res.failed} failed` : ""
            }`,
      );
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-[var(--ipp-primary)]/30 bg-[var(--ipp-primary)]/5 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ipp-text)]">
            AI pre-screen
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--ipp-secondary)]">
            Reads each pending application — answers, profile, member history,
            domain traffic — and writes a verdict plus a summary onto the row, so
            you can decide from this page instead of opening every one. It never
            changes status; you still confirm every decision.
            {unreviewedCount > 0 && (
              <span className="mt-1 block font-medium text-[var(--ipp-text)]">
                {unreviewedCount} pending row
                {unreviewedCount === 1 ? "" : "s"} not screened yet.
              </span>
            )}
            {!aiConfigured && (
              <span className="mt-1 block text-amber-900">
                OPENAI_API_KEY not set — rows get a deterministic identity
                summary only, with no verdict reasoning.
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(false)}
            className="min-h-10 rounded-lg bg-[var(--ipp-primary)] px-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {pending ? "Screening…" : "Screen next 25"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(true)}
            className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--ipp-secondary)] disabled:opacity-40"
          >
            Re-screen top 25
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-xs text-[var(--ipp-secondary)]" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
