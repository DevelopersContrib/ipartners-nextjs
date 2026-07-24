"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendEngagementCampaign } from "@/lib/admin-actions";
import { CAMPAIGN_KEYS } from "@/lib/campaign-keys";

export type CampaignSendRow = {
  campaignKey: string;
  sendStatus: string;
  providerId: string | null;
  error: string | null;
  createdAt: string;
};

export default function CampaignSends({
  engagementId,
  sends,
}: {
  engagementId: string;
  sends: CampaignSendRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const byKey = Object.fromEntries(sends.map((s) => [s.campaignKey, s]));

  const resend = (key: string) =>
    startTransition(async () => {
      const res = await resendEngagementCampaign(engagementId, key);
      setMessage(res.ok ? `Resent “${key}”` : res.error || "Resend failed");
      if (res.ok) router.refresh();
    });

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--ipp-text)] mb-1">SES campaigns</h2>
      <p className="text-xs text-[var(--ipp-secondary)] mb-4">
        Automated partner emails. Each campaign sends once per engagement unless you force
        resend.
      </p>

      <ul className="space-y-2">
        {CAMPAIGN_KEYS.map((key) => {
          const row = byKey[key];
          return (
            <li
              key={key}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm border border-[var(--border)] rounded-xl px-3 py-2"
            >
              <span className="font-medium capitalize text-[var(--ipp-text)]">{key}</span>
              {row ? (
                <span className="text-xs text-[var(--ipp-secondary)]">
                  {row.sendStatus}
                  {" · "}
                  {new Date(row.createdAt).toISOString().slice(0, 16).replace("T", " ")} UTC
                  {row.error && <span className="text-red-700"> · {row.error}</span>}
                </span>
              ) : (
                <span className="text-xs text-[var(--ipp-secondary)]">not sent</span>
              )}
              <button
                type="button"
                onClick={() => resend(key)}
                disabled={pending}
                className="ml-auto min-h-9 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--ipp-secondary)] disabled:opacity-40"
              >
                {row ? "Resend" : "Send"}
              </button>
            </li>
          );
        })}
      </ul>

      {message && (
        <p className="text-xs text-[var(--ipp-secondary)] mt-3" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
