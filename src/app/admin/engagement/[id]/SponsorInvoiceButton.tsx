"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendSponsorInvoice } from "@/lib/admin-actions";

export default function SponsorInvoiceButton({
  engagementId,
  tier,
}: {
  engagementId: string;
  tier: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-sm font-semibold text-[var(--ipp-text)]">Sponsor invoice</p>
      <p className="mt-1 text-xs text-[var(--ipp-secondary)]">
        Checkout isn&apos;t live yet. Email payment next-steps for the{" "}
        <span className="capitalize">{tier || "unset"}</span> tier (Bronze $500 / Silver
        $2,500 / Gold $10,000 per year).
      </p>
      <button
        type="button"
        disabled={pending || !tier}
        onClick={() =>
          startTransition(async () => {
            const res = await sendSponsorInvoice(engagementId);
            setMessage(res.ok ? "Invoice email sent" : res.error || "Send failed");
            if (res.ok) router.refresh();
          })
        }
        className="mt-3 min-h-10 rounded-lg bg-[var(--ipp-primary)] px-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Sending…" : "Email invoice"}
      </button>
      {!tier && (
        <p className="mt-2 text-xs text-amber-900">Set a tier on the form below first.</p>
      )}
      {message && (
        <p className="mt-2 text-xs text-[var(--ipp-secondary)]" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
