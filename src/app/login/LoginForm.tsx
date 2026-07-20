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
  "w-full px-4 py-3 border border-[#1E2D25] rounded-xl bg-[#0A0F0D] focus:bg-[#0D1210] text-white text-base transition-colors placeholder:text-[#5A6E62] focus:outline-none focus:border-[#3A5D4A]";

const btnClass =
  "w-full px-4 py-3 rounded-xl bg-white text-[#0A0F0D] font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl"
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
          <label htmlFor="email" className="block text-sm font-medium text-[#8B9E93] mb-1.5">
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
          {reqPending ? "Sending code…" : "Email me a sign-in code"}
        </button>
        <p className="text-xs text-[#5A6E62] text-center">
          No password needed. We&apos;ll email you a 6-digit code.
        </p>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="email" value={reqState.email} />
      <input type="hidden" name="next" value={reqState.next} />
      <p className="text-sm text-[#8B9E93]">
        We emailed a 6-digit code to <span className="text-white font-medium">{reqState.email}</span>.
      </p>
      {reqState.devCode && (
        <p className="text-xs text-[#5A6E62]">
          Dev mode — your code is{" "}
          <span className="text-white font-mono tracking-widest">{reqState.devCode}</span>
        </p>
      )}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-[#8B9E93] mb-1.5">
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
        {verPending ? "Verifying…" : "Verify & sign in"}
      </button>
    </form>
  );
}
