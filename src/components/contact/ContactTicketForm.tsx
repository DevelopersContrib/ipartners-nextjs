"use client";

import { useState } from "react";

export default function ContactTicketForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as { error?: string; publicId?: string };
      if (!res.ok || !data.publicId) throw new Error(data.error || "Could not send");
      setPublicId(data.publicId);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (publicId) {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-200">Message received</p>
        <p className="mt-2 text-sm text-emerald-100/80">
          Reference <span className="font-mono font-bold">{publicId}</span>. Check your email
          for a confirmation — you can reply to continue the thread.
        </p>
        <button
          type="button"
          onClick={() => setPublicId(null)}
          className="mt-4 text-sm font-semibold text-emerald-300 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5A6E62]">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[#1E2D25] bg-[#0D1210] px-3 py-2 text-sm text-white outline-none focus:border-[#15803D]"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5A6E62]">
          Email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#1E2D25] bg-[#0D1210] px-3 py-2 text-sm text-white outline-none focus:border-[#15803D]"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5A6E62]">
          Message
        </label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-[#1E2D25] bg-[#0D1210] px-3 py-2 text-sm text-white outline-none focus:border-[#15803D]"
          placeholder="How can we help?"
        />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center rounded-xl bg-[#15803D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#166534] disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
