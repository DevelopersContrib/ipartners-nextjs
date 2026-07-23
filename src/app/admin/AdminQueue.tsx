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
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-green-50 text-green-800 border-green-200",
  active: "bg-green-50 text-green-800 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  lapsed: "bg-gray-100 text-gray-600 border-gray-200",
};

const BULK = ["approved", "active", "declined", "pending", "lapsed"] as const;

export default function AdminQueue({ rows }: { rows: QueueRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
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

  const run = (status: string) => {
    if (confirming !== status) {
      setConfirming(status);
      setMessage(null);
      return;
    }
    setConfirming(null);
    startTransition(async () => {
      const res = await setEngagementStatus([...selected], status);
      setMessage(
        res.ok ? `${res.changed} updated → ${status}` : res.error || "Failed"
      );
      if (res.ok) setSelected(new Set());
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-[var(--ipp-secondary)]">
          <input type="checkbox" checked={allVisible} onChange={toggleAll} className="w-4 h-4" />
          {selected.size > 0 ? `${selected.size} selected` : "Select all on page"}
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {confirming && (
            <span className="text-xs text-[var(--ipp-secondary)]">
              Click again to confirm &ldquo;{confirming}&rdquo;
            </span>
          )}
          {BULK.map((s) => (
            <button
              key={s}
              onClick={() => run(s)}
              disabled={pending || selected.size === 0}
              className={`min-h-10 px-3 rounded-lg text-sm font-semibold capitalize disabled:opacity-40 ${
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
      {message && (
        <p className="text-sm text-[var(--ipp-secondary)] mb-3" role="status">
          {message}
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              className="w-4 h-4"
              aria-label={`Select ${r.email}`}
            />
            <div className="min-w-0">
              <Link
                href={`/admin/engagement/${r.id}`}
                className="text-sm font-semibold text-[var(--ipp-text)] hover:underline underline-offset-2 break-all"
              >
                {r.email}
              </Link>
              <p className="text-xs text-[var(--ipp-secondary)]">
                <span className="capitalize">{r.mode.replace("_", " ")}</span>
                {r.scopeValue && <span className="font-mono"> · {r.scopeValue}</span>}
                {r.tier && <span className="capitalize"> · {r.tier}</span>}
              </p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full border capitalize ${
                STATUS_STYLES[r.status] || STATUS_STYLES.lapsed
              }`}
            >
              {ENGAGEMENT_STATUSES.includes(r.status as never) ? r.status : r.status}
            </span>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="text-sm text-[var(--ipp-secondary)] py-8 text-center">
          Nothing matches these filters.
        </p>
      )}
    </div>
  );
}
