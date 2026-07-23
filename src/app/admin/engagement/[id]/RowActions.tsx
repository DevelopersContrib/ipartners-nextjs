"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEngagementStatus } from "@/lib/admin-actions";
import { ENGAGEMENT_STATUSES } from "@/lib/admin-client";

export default function RowActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const act = (next: string) =>
    startTransition(async () => {
      const res = await setEngagementStatus([id], next);
      if (!res.ok) setError(res.error || "Failed");
      else router.refresh();
    });

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {ENGAGEMENT_STATUSES.filter((s) => s !== status).map((s) => (
          <button
            key={s}
            onClick={() => act(s)}
            disabled={pending}
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
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
