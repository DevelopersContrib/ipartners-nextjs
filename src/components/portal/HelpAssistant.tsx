"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Linked = { slug: string; title: string };

const SUGGESTIONS = [
  "How do I apply for a partnership?",
  "What does PartnerScore mean?",
  "Where do I track my deals?",
  "How do placement sponsorships work?",
];

function renderAnswer(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function HelpAssistant({
  aiConfigured,
  compact = false,
}: {
  aiConfigured: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(!compact);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [links, setLinks] = useState<Linked[]>([]);
  const [mode, setMode] = useState<"openai" | "local" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/help/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 401) {
        setError("Please sign in again to use Ask AI.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Try again or email hello@ipartner.com.");
        return;
      }
      const data = (await res.json()) as {
        answer: string;
        mode: "openai" | "local";
        articles?: Linked[];
      };
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
      setMode(data.mode);
      setLinks(data.articles || []);
    } catch {
      setError("Network error. Check your connection and retry.");
    } finally {
      setPending(false);
    }
  }

  const panel = (
    <div
      className={`flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
        compact ? "h-[min(28rem,70dvh)]" : "min-h-[22rem]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">Ask AI</p>
          <p className="text-[11px] text-zinc-500">
            {aiConfigured
              ? "Answers from our help guides + AI"
              : "Answers grounded in our partner help guides"}
          </p>
        </div>
        {compact && (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-left text-[11px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`max-w-[95%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-zinc-900 text-white"
                : "bg-zinc-50 text-zinc-700"
            }`}
          >
            {m.role === "assistant" ? renderAnswer(m.content) : m.content}
          </div>
        ))}

        {pending && (
          <p className="animate-pulse text-xs text-zinc-400">Thinking…</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {links.length > 0 && !pending && (
        <div className="border-t border-zinc-100 px-4 py-2">
          <p className="mb-1.5 text-[11px] font-medium text-zinc-400">Related guides</p>
          <div className="flex flex-wrap gap-2">
            {links.map((a) => (
              <Link
                key={a.slug}
                href={`/portal/help/${a.slug}`}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-200"
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {mode && !pending && (
        <p className="px-4 text-[10px] text-zinc-400">
          {mode === "openai" ? "Answered with AI" : "Answered from help guides"}
        </p>
      )}

      <form
        className="flex gap-2 border-t border-zinc-100 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the portal…"
          className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-300 focus:bg-white"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="h-11 shrink-0 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );

  if (!compact) return panel;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-3 z-20 inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white shadow-lg lg:bottom-6 lg:right-6"
      >
        Ask AI
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40"
            aria-label="Close assistant"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md">{panel}</div>
        </div>
      )}
    </>
  );
}
