"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Campaign = {
  id: number;
  campaign_key: string;
  name: string;
  segment_key: string | null;
  enabled: boolean;
};

export default function EmailsAiClient({
  initialCampaigns,
}: {
  initialCampaigns: Campaign[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ensureDefaults() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/emails-ai/ensure", { method: "POST" });
      const data = (await res.json()) as { error?: string; detail?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.detail || "Default segments & campaigns ready.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--ipp-text)]">Campaigns</h2>
          <p className="text-sm text-[var(--ipp-secondary)]">
            Seed the default 10-email partner tour, then enroll users via API/cron.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void ensureDefaults()}
          className="inline-flex min-h-10 items-center rounded-lg bg-[var(--ipp-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Working…" : "Ensure default campaigns"}
        </button>
      </div>
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="text-sm text-rose-600">{err}</p> : null}

      {initialCampaigns.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--ipp-secondary)]">
          No campaigns yet — click Ensure default campaigns.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {initialCampaigns.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--ipp-text)]">{c.name}</p>
                <p className="font-mono text-xs text-[var(--ipp-secondary)]">
                  {c.campaign_key}
                  {c.segment_key ? ` · ${c.segment_key}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--ipp-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ipp-secondary)]">
                {c.enabled ? "On" : "Off"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
