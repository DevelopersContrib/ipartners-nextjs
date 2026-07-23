"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createEngagementAdmin,
  updateEngagementAdmin,
  type EngagementInput,
} from "@/lib/admin-actions";
import { ENGAGEMENT_MODES, MODE_LABELS } from "@/lib/engagement-modes";
import {
  ENGAGEMENT_STATUSES,
  SCOPE_TYPES,
  SPONSOR_TIERS,
} from "@/lib/admin-client";

export type EngagementFormValues = EngagementInput & { id?: string };

const inputClass =
  "w-full min-h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm text-[var(--ipp-text)]";
const labelClass = "block text-xs font-medium text-[var(--ipp-secondary)] mb-1";

export default function EngagementForm({
  initial,
  mode,
}: {
  initial?: Partial<EngagementFormValues>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [engagementMode, setEngagementMode] = useState(initial?.mode || "builder");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: EngagementInput = {
      email: String(fd.get("email") || ""),
      mode: String(fd.get("mode") || ""),
      scopeType: String(fd.get("scopeType") || ""),
      scopeValue: String(fd.get("scopeValue") || ""),
      status: String(fd.get("status") || ""),
      tier: String(fd.get("tier") || ""),
      termStart: String(fd.get("termStart") || ""),
      termEnd: String(fd.get("termEnd") || ""),
    };

    setError(null);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createEngagementAdmin(input);
        // redirect() on success — only land here on validation errors
        if (res && !res.ok) setError(res.error || "Failed to create");
        return;
      }
      if (!initial?.id) {
        setError("Missing engagement id");
        return;
      }
      const res = await updateEngagementAdmin(initial.id, input);
      if (!res.ok) setError(res.error || "Failed to save");
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="email">
            Partner email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={initial?.email || ""}
            className={inputClass}
            autoComplete="email"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="mode">
            Mode
          </label>
          <select
            id="mode"
            name="mode"
            required
            value={engagementMode}
            onChange={(e) => setEngagementMode(e.target.value)}
            className={inputClass}
          >
            {ENGAGEMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={initial?.status || "pending"}
            className={`${inputClass} capitalize`}
          >
            {ENGAGEMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="scopeType">
            Scope type
          </label>
          <select
            id="scopeType"
            name="scopeType"
            required
            defaultValue={initial?.scopeType || "domain"}
            className={inputClass}
          >
            {SCOPE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="scopeValue">
            Scope value
          </label>
          <input
            id="scopeValue"
            name="scopeValue"
            type="text"
            defaultValue={initial?.scopeValue || ""}
            placeholder="domain.com or vertical slug"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="tier">
            Sponsor tier
          </label>
          <select
            id="tier"
            name="tier"
            defaultValue={initial?.tier || ""}
            disabled={engagementMode !== "sponsor"}
            className={inputClass}
          >
            <option value="">—</option>
            {SPONSOR_TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="termStart">
            Term start
          </label>
          <input
            id="termStart"
            name="termStart"
            type="date"
            defaultValue={initial?.termStart || ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="termEnd">
            Term end
          </label>
          <input
            id="termEnd"
            name="termEnd"
            type="date"
            defaultValue={initial?.termEnd || ""}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 px-5 rounded-lg bg-[var(--ipp-primary)] text-white text-sm font-semibold disabled:opacity-40"
        >
          {pending ? "Saving…" : mode === "create" ? "Create engagement" : "Save changes"}
        </button>
        {mode === "edit" && !pending && error === null && (
          <span className="self-center text-xs text-[var(--ipp-secondary)]">
            Changes apply to the network record only — not the live widget.
          </span>
        )}
      </div>
    </form>
  );
}
