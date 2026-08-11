"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEngagementStatus } from "@/lib/admin-actions";
import { ENGAGEMENT_STATUSES } from "@/lib/admin-client";
import { STATUS_MEANING } from "@/lib/manage-handoff";

export default function RowActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const act = (next: string) => {
    if (next === "declined" && confirming !== "declined") {
      setConfirming("declined");
      setError(null);
      return;
    }
    if (next === "declined" && reason.trim().length < 3) {
      setError("Decline requires a short reason");
      return;
    }
    startTransition(async () => {
      const res = await setEngagementStatus([id], next, {
        reason: reason.trim() || undefined,
      });
      if (!res.ok) setError(res.error || "Failed");
      else {
        setConfirming(null);
        setReason("");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex max-w-sm flex-col items-end gap-2">
      <p className="text-right text-[11px] text-[var(--ipp-secondary)]">
        {STATUS_MEANING[status as keyof typeof STATUS_MEANING] || status}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        {ENGAGEMENT_STATUSES.filter((s) => s !== status).map((s) => (
          <button
            key={s}
            onClick={() => act(s)}
            disabled={pending}
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
      {confirming === "declined" && (
        <label className="w-full text-xs text-[var(--ipp-secondary)]">
          Decline reason
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why not moving forward?"
            className="mt-1 min-h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm"
          />
        </label>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
