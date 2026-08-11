"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setEngagementStatus } from "@/lib/admin-actions";
import { ENGAGEMENT_STATUSES } from "@/lib/admin-client";

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
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-green-50 text-green-800 border-green-200",
  active: "bg-green-50 text-green-800 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  lapsed: "bg-gray-100 text-gray-600 border-gray-200",
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
      setReason("");
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
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3"
          >
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              className="h-4 w-4"
              aria-label={`Select ${r.email}`}
            />
            <div className="min-w-0">
              <Link
                href={`/admin/engagement/${r.id}`}
                className="break-all text-sm font-semibold text-[var(--ipp-text)] underline-offset-2 hover:underline"
              >
                {r.email}
              </Link>
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
            </div>
            <span
              className={`ml-auto rounded-full border px-2 py-0.5 text-xs capitalize ${
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
