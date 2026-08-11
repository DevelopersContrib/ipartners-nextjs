"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  autoDeclineFraud,
  type FraudSweepHit,
} from "@/lib/admin-actions";

export default function FraudSweep({ aiConfigured }: { aiConfigured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [useAi, setUseAi] = useState(aiConfigured);
  const [message, setMessage] = useState<string | null>(null);
  const [hits, setHits] = useState<FraudSweepHit[] | null>(null);
  const [lastDryRun, setLastDryRun] = useState(true);

  const run = (dryRun: boolean) => {
    startTransition(async () => {
      setMessage(null);
      const res = await autoDeclineFraud({
        dryRun,
        confirmPhrase: dryRun ? undefined : confirmPhrase,
        limit: 80,
        useAi,
      });
      if (!res.ok) {
        setMessage(res.error || "Sweep failed");
        return;
      }
      setHits(res.hits);
      setLastDryRun(res.dryRun);
      setMessage(
        res.dryRun
          ? `Preview: ${res.hits.length} of ${res.scanned} pending would be declined${
              res.aiEnabled ? " (heuristics + AI)" : " (heuristics only)"
            }`
          : `Declined ${res.declined} fraudulent / junk application${
              res.declined === 1 ? "" : "s"
            } (no SES email sent)`,
      );
      if (!res.dryRun) {
        setConfirmPhrase("");
        router.refresh();
      }
    });
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ipp-text)]">
            AI fraud auto-decline
          </p>
          <p className="mt-1 max-w-xl text-xs text-[var(--ipp-secondary)] leading-relaxed">
            Screens pending rows for disposable emails (mailinator, tempmail, …) and
            spammy applications. Preview first, then CONFIRM to decline. Skips decline
            emails so SES reputation stays clean.
            {!aiConfigured && (
              <span className="block mt-1 text-amber-900">
                OPENAI_API_KEY not set — heuristics only until the key is available.
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--ipp-secondary)]">
            <input
              type="checkbox"
              checked={useAi && aiConfigured}
              disabled={!aiConfigured || pending}
              onChange={(e) => setUseAi(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Use AI
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(true)}
            className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--ipp-secondary)] disabled:opacity-40"
          >
            {pending && lastDryRun !== false ? "Scanning…" : "Preview"}
          </button>
          <input
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
            placeholder="CONFIRM"
            disabled={pending}
            className="min-h-10 w-28 rounded-lg border border-[var(--border)] bg-white px-2 font-mono text-xs uppercase"
          />
          <button
            type="button"
            disabled={pending || confirmPhrase.trim().toUpperCase() !== "CONFIRM"}
            onClick={() => run(false)}
            className="min-h-10 rounded-lg border border-red-300 bg-white px-3 text-sm font-semibold text-red-700 disabled:opacity-40"
          >
            Decline hits
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-xs text-[var(--ipp-secondary)]" role="status">
          {message}
        </p>
      )}

      {hits && hits.length > 0 && (
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs">
          {hits.map((h) => (
            <li
              key={h.id}
              className="rounded-lg border border-red-100 bg-white/80 px-2 py-1.5 text-[var(--ipp-text)]"
            >
              <span className="font-medium break-all">{h.email}</span>
              {h.scopeValue && (
                <span className="font-mono text-[var(--ipp-secondary)]">
                  {" "}
                  · {h.scopeValue}
                </span>
              )}
              <span className="text-[var(--ipp-secondary)]">
                {" "}
                · {h.layer} {(h.confidence * 100).toFixed(0)}% — {h.reason}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
