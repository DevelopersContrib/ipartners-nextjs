"use client";

import { useActionState } from "react";
import Link from "next/link";
import { acceptHandoff } from "@/lib/handoff-actions";

type State = { ok: false; error: string } | null;

export default function ContinueForm({
  token,
  email,
  domain,
  type,
}: {
  token: string;
  email: string;
  domain?: string;
  type?: string;
}) {
  const [state, action, pending] = useActionState<State, FormData>(acceptHandoff, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="bg-[#0A0F0D] border border-[#1E2D25] rounded-xl p-4">
        <p className="text-xs text-[#5A6E62] mb-1">Continuing as</p>
        <p className="text-white font-medium break-all">{email}</p>
        {(domain || type) && (
          <p className="text-xs text-[#8B9E93] mt-2">
            {domain && <span className="font-mono">{domain}</span>}
            {domain && type && " · "}
            {type && <span>{type} partnership</span>}
          </p>
        )}
      </div>

      {state && !state.ok && (
        <div role="alert" className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-3 rounded-xl bg-white text-[#0A0F0D] font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Continuing…" : "Continue to my application"}
      </button>

      <p className="text-center text-xs text-[#5A6E62]">
        Not you?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Sign in with a different email
        </Link>
      </p>
    </form>
  );
}
