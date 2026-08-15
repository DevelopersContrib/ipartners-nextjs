"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setEngagementStatus } from "@/lib/admin-actions";
import { ENGAGEMENT_STATUSES } from "@/lib/admin-client";

export type QueueReview = {
  verdict: string;
  confidence: number;
  reason: string;
  summary: string[];
  flags: string[];
  layer: string;
};

export type QueueRow = {
  id: string;
  email: string;
  mode: string;
  scopeType?: string;
  scopeValue: string | null;
  status: string;
  tier: string | null;
  createdAt: string;
  triageScore?: number;
  ageDays?: number;
  visitors30d?: number;
  review?: QueueReview | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-green-50 text-green-800 border-green-200",
  active: "bg-green-50 text-green-800 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  lapsed: "bg-gray-100 text-gray-600 border-gray-200",
};

const VERDICT_STYLES: Record<string, string> = {
  approve: "bg-emerald-50 text-emerald-800 border-emerald-200",
  decline: "bg-red-50 text-red-700 border-red-200",
  needs_info: "bg-amber-50 text-amber-900 border-amber-200",
  review: "bg-blue-50 text-blue-800 border-blue-200",
};

const VERDICT_LABELS: Record<string, string> = {
  approve: "AI: approve",
  decline: "AI: decline",
  needs_info: "AI: needs info",
  review: "AI: read it",
};

const BULK = ["approved", "active", "declined", "pending", "lapsed"] as const;

export default function AdminQueue({
  rows,
  showTriage = false,
}: {
  rows: QueueRow[];
  showTriage?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisible = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allVisible ? new Set() : new Set(rows.map((r) => r.id)));

  const recommended = (verdict: string) =>
    rows.filter((r) => r.review?.verdict === verdict);

  /** Pre-select the AI's picks and prefill the reason — admin still confirms. */
  const selectRecommended = (verdict: string) => {
    const ids = recommended(verdict).map((r) => r.id);
    setSelected(new Set(ids));
    setConfirming(null);
    setConfirmPhrase("");
    setReason(
      verdict === "approve"
        ? "AI pre-screen recommended approve — reviewed in queue"
        : "AI pre-screen recommended decline — reviewed in queue",
    );
    setMessage(
      ids.length
        ? `${ids.length} AI-${verdict} row${ids.length === 1 ? "" : "s"} selected — press ${verdict === "approve" ? "approved" : "declined"} to confirm`
        : `No rows on this page are AI-${verdict}`,
    );
  };

  const needsReason =
    confirming === "declined" ||
    (confirming === "approved" && selected.size > 1);
  const needsConfirmPhrase =
    !!confirming &&
    selected.size > 1 &&
    (confirming === "approved" ||
      confirming === "declined" ||
      confirming === "active");

  const run = (status: string) => {
    if (confirming !== status) {
      setConfirming(status);
      setMessage(null);
      setConfirmPhrase("");
      return;
    }
    startTransition(async () => {
      const res = await setEngagementStatus([...selected], status, {
        reason: reason.trim() || undefined,
        confirmPhrase: confirmPhrase.trim() || undefined,
      });
      setMessage(
        res.ok ? `${res.changed} updated → ${status}` : res.error || "Failed",
      );
      if (res.ok) {
        setSelected(new Set());
        setConfirming(null);
        setReason("");
        setConfirmPhrase("");
      }
    });
  };

  const approveCount = recommended("approve").length;
  const declineCount = recommended("decline").length;

  return (
    <div>
      <div className="mb-4 space-y-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--ipp-secondary)]">
            <input
              type="checkbox"
              checked={allVisible}
              onChange={toggleAll}
              className="h-4 w-4"
            />
            {selected.size > 0
              ? `${selected.size} selected`
              : "Select all on page"}
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {confirming && (
              <span className="text-xs text-[var(--ipp-secondary)]">
                Confirm &ldquo;{confirming}&rdquo; below, then click again
              </span>
            )}
            {BULK.map((s) => (
              <button
                key={s}
                onClick={() => run(s)}
                disabled={pending || selected.size === 0}
                className={`min-h-10 rounded-lg px-3 text-sm font-semibold capitalize disabled:opacity-40 ${
                  s === "approved" || s === "active"
                    ? "bg-[var(--ipp-primary)] text-white"
                    : s === "declined"
                      ? "border border-red-300 text-red-700"
                      : "border border-[var(--border)] text-[var(--ipp-secondary)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {(approveCount > 0 || declineCount > 0) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
            <span className="text-xs text-[var(--ipp-secondary)]">
              Confirm the AI&rsquo;s picks on this page:
            </span>
            {approveCount > 0 && (
              <button
                type="button"
                onClick={() => selectRecommended("approve")}
                disabled={pending}
                className="min-h-9 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 disabled:opacity-40"
              >
                Select {approveCount} AI-approve
              </button>
            )}
            {declineCount > 0 && (
              <button
                type="button"
                onClick={() => selectRecommended("decline")}
                disabled={pending}
                className="min-h-9 rounded-lg border border-red-300 bg-red-50 px-3 text-xs font-semibold text-red-700 disabled:opacity-40"
              >
                Select {declineCount} AI-decline
              </button>
            )}
          </div>
        )}

        {confirming && (needsReason || needsConfirmPhrase) && (
          <div className="grid gap-2 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
            {needsReason && (
              <label className="block text-xs text-[var(--ipp-secondary)]">
                Reason (required)
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. incomplete profile / strong domain fit"
                  className="mt-1 min-h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm"
                />
              </label>
            )}
            {needsConfirmPhrase && (
              <label className="block text-xs text-[var(--ipp-secondary)]">
                Type CONFIRM for bulk {confirming}
                <input
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="CONFIRM"
                  className="mt-1 min-h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm font-mono uppercase"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {message && (
        <p className="mb-3 text-sm text-[var(--ipp-secondary)]" role="status">
          {message}
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-start gap-x-3 gap-y-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3"
          >
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              className="mt-1 h-4 w-4"
              aria-label={`Select ${r.email}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/engagement/${r.id}`}
                  className="break-all text-sm font-semibold text-[var(--ipp-text)] underline-offset-2 hover:underline"
                >
                  {r.email}
                </Link>
                {r.review && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      VERDICT_STYLES[r.review.verdict] || VERDICT_STYLES.review
                    }`}
                  >
                    {VERDICT_LABELS[r.review.verdict] || r.review.verdict}
                    {r.review.confidence > 0
                      ? ` ${Math.round(r.review.confidence * 100)}%`
                      : ""}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--ipp-secondary)]">
                <span className="capitalize">{r.mode.replace("_", " ")}</span>
                {r.scopeValue && (
                  <span className="font-mono"> · {r.scopeValue}</span>
                )}
                {r.tier && <span className="capitalize"> · {r.tier}</span>}
                {showTriage && r.triageScore != null && (
                  <span className="tabular-nums">
                    {" "}
                    · score {r.triageScore}
                    {r.ageDays != null ? ` · ${r.ageDays}d` : ""}
                    {r.visitors30d != null && r.visitors30d > 0
                      ? ` · ${r.visitors30d.toLocaleString("en-US")} UV/30d`
                      : ""}
                  </span>
                )}
              </p>

              {r.review && (
                <div className="mt-1.5 space-y-1">
                  {r.review.summary[0] && (
                    <p className="text-xs text-[var(--ipp-text)]">
                      {r.review.summary[0]}
                    </p>
                  )}
                  {r.review.reason && (
                    <p className="text-xs italic text-[var(--ipp-secondary)]">
                      {r.review.reason}
                    </p>
                  )}
                  {r.review.flags.length > 0 && (
                    <p className="text-[11px] text-amber-800">
                      {r.review.flags.join(" · ")}
                    </p>
                  )}
                </div>
              )}
              {!r.review && r.status === "pending" && (
                <p className="mt-1.5 text-[11px] text-[var(--ipp-secondary)]">
                  Not screened yet — run the AI pre-screen above.
                </p>
              )}
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs capitalize ${
                STATUS_STYLES[r.status] || STATUS_STYLES.lapsed
              }`}
            >
              {ENGAGEMENT_STATUSES.includes(r.status as never)
                ? r.status
                : r.status}
            </span>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--ipp-secondary)]">
          Nothing matches these filters.
        </p>
      )}
    </div>
  );
}
