"use client";

type AgentMsg = {
  role: string;
  content: string;
  metaJson: string | null;
  createdAt: string;
};

export default function AgentThread({
  messages,
}: {
  messages: AgentMsg[];
}) {
  if (messages.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--ipp-text)]">Partner agent</h2>
        <p className="mt-1 text-xs text-[var(--ipp-secondary)]">
          No chat yet. Pending partners can talk to the agent from{" "}
          <code className="font-mono">/portal/deals</code>.
        </p>
      </section>
    );
  }

  const lastMeta = [...messages]
    .reverse()
    .map((m) => {
      if (!m.metaJson) return null;
      try {
        return JSON.parse(m.metaJson) as {
          action?: string;
          confidence?: number;
          reason?: string;
        };
      } catch {
        return null;
      }
    })
    .find(Boolean);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--ipp-text)]">Partner agent</h2>
      <p className="mt-1 text-xs text-[var(--ipp-secondary)] mb-3">
        Qualification chat. Approve manually unless{" "}
        <code className="font-mono">AGENT_AUTO_APPROVE</code> is on.
      </p>
      {lastMeta?.action && (
        <p
          className={`mb-3 rounded-lg px-3 py-2 text-xs ${
            lastMeta.action === "approve"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : lastMeta.action === "decline"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          Agent recommends <strong>{lastMeta.action}</strong>
          {lastMeta.confidence != null
            ? ` (${Math.round(lastMeta.confidence * 100)}%)`
            : ""}
          {lastMeta.reason ? ` — ${lastMeta.reason}` : ""}
        </p>
      )}
      <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
        {messages.map((m, i) => (
          <li
            key={`${m.createdAt}-${i}`}
            className="rounded-lg border border-[var(--border)] px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--ipp-secondary)]">
              {m.role}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-[var(--ipp-text)]">{m.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
