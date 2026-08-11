"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

export default function PendingPartnerAgent({
  engagementId,
  scopeLabel,
}: {
  engagementId: string;
  scopeLabel: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/portal/agent/chat?engagementId=${encodeURIComponent(engagementId)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: { role: string; content: string }[];
        };
        if (cancelled) return;
        setMessages(
          (data.messages || [])
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
        );
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const send = () => {
    const q = input.trim();
    if (!q || pending) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);

    startTransition(async () => {
      try {
        const res = await fetch("/api/portal/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ engagementId, message: q }),
        });
        const data = (await res.json()) as {
          answer?: string;
          approved?: boolean;
          growagentPushed?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setError(data.error || "Agent unavailable");
          return;
        }
        setMessages([
          ...next,
          { role: "assistant", content: data.answer || "…" },
        ]);
        if (data.approved) router.refresh();
      } catch {
        setError("Something went wrong. Try again or email hello@ipartner.com.");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-zinc-900">Partner agent</h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Chat about your pending application for{" "}
        <span className="font-mono text-zinc-700">{scopeLabel}</span>. The agent
        may qualify you for approval; deeper nurture continues after approve.
      </p>

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 text-sm">
        {!loaded && (
          <p className="text-xs text-zinc-400">Loading conversation…</p>
        )}
        {loaded && messages.length === 0 && (
          <p className="text-xs text-zinc-500">
            Say hi — share what you bring to this partnership, timeline, and any
            domain proof.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`rounded-lg px-3 py-2 ${
              m.role === "user"
                ? "ml-6 bg-zinc-900 text-white"
                : "mr-6 bg-white text-zinc-800 border border-zinc-200"
            }`}
          >
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
              {m.content}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={pending}
          placeholder="Tell the agent about your partnership…"
          className="min-h-11 flex-1 rounded-xl border border-zinc-200 px-3 text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || !input.trim()}
          className="min-h-11 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {pending ? "…" : "Send"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </section>
  );
}
