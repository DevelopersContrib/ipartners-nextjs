"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { requestAuthCode, verifyAuthCode } from "@/lib/auth-actions";

type RequestState =
  | { ok: true; email: string; next: string; devCode?: string }
  | { ok: false; error: string }
  | null;

type VerifyState = { ok: false; email: string; next: string; error: string } | null;

const inputClass =
  "w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--ipp-bg)] focus:bg-white text-[var(--ipp-text)] text-base transition-colors placeholder:text-[var(--ipp-secondary)] focus:outline-none focus:border-[var(--ipp-primary)]";

const btnClass =
  "w-full min-h-12 px-4 py-3 rounded-xl bg-[var(--ipp-primary)] text-white font-semibold text-base transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed";

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 text-[#c23b3b] text-sm bg-[#c23b3b]/10 border border-[#c23b3b]/20 p-3.5 rounded-xl"
    >
      {children}
    </div>
  );
}

export default function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/portal";

  const [reqState, requestAction, reqPending] = useActionState<RequestState, FormData>(
    requestAuthCode,
    null,
  );
  const [verState, verifyAction, verPending] = useActionState<VerifyState, FormData>(
    verifyAuthCode,
    null,
  );

  const codeSent = reqState?.ok === true;

  if (!codeSent) {
    return (
      <form action={requestAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--ipp-secondary)] mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        {reqState && reqState.ok === false && <ErrorNote>{reqState.error}</ErrorNote>}
        <button type="submit" disabled={reqPending} className={btnClass}>
          {reqPending ? "Sending code…" : "Email me a code"}
        </button>
        <p className="text-xs text-[var(--ipp-secondary)] text-center">
          No password needed. We&apos;ll email you a 6-digit code.
        </p>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="email" value={reqState.email} />
      <input type="hidden" name="next" value={reqState.next} />
      <p className="text-sm text-[var(--ipp-secondary)]">
        We emailed a 6-digit code to <span className="text-[var(--ipp-text)] font-medium">{reqState.email}</span>.
      </p>
      {reqState.devCode && (
        <p className="text-xs text-[var(--ipp-secondary)]">
          Dev mode — your code is{" "}
          <span className="text-[var(--ipp-text)] font-mono tracking-widest">{reqState.devCode}</span>
        </p>
      )}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-[var(--ipp-secondary)] mb-1.5">
          6-digit code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="000000"
          className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`}
        />
      </div>
      {verState && verState.ok === false && <ErrorNote>{verState.error}</ErrorNote>}
      <button type="submit" disabled={verPending} className={btnClass}>
        {verPending ? "Verifying…" : "Verify & continue"}
      </button>
    </form>
  );
}
