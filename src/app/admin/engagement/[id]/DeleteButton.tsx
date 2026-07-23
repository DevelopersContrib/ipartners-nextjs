"use client";

import { useState, useTransition } from "react";
import { deleteEngagementAdmin } from "@/lib/admin-actions";

export default function DeleteButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteEngagementAdmin(id);
      // redirect on success — only land here on error
      if (res && !res.ok) {
        setError(res.error || "Delete failed");
        setArmed(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="min-h-10 px-4 rounded-lg border border-red-300 text-red-700 text-sm font-semibold disabled:opacity-40"
      >
        {pending ? "Deleting…" : armed ? "Confirm delete" : "Delete engagement"}
      </button>
      {armed && !pending && (
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="text-xs text-[var(--ipp-secondary)] underline underline-offset-2"
        >
          Cancel
        </button>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
