import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — iPartners",
  description: "Sign in to your iPartners account to manage your partnerships.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const partner = await getCurrentPartner();
  const { next } = await searchParams;
  if (partner) redirect(next && next.startsWith("/") ? next : "/portal");

  return (
    <main className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            iPartners
          </Link>
          <p className="text-[#5A6E62] text-sm mt-2">Manage your partnerships</p>
        </div>

        <div className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-sm text-[#5A6E62] mb-6">
            Use the email you applied with — we&apos;ll find your applications and partnerships.
          </p>
          <Suspense fallback={<p className="text-[#5A6E62] text-sm">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-[#5A6E62] mt-6">
          New here?{" "}
          <Link href="/apply" className="text-[#8B9E93] underline underline-offset-4">
            Apply for a partnership
          </Link>{" "}
          — you can sign in afterwards to track it.
        </p>
      </div>
    </main>
  );
}
