import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png";

export const metadata: Metadata = {
  title: "Login — iPartner",
  description: "Sign in to your iPartner account with an email code.",
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
    <main className="min-h-screen bg-[var(--ipp-bg)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-10 sm:h-12 w-auto" />
          </Link>
          <p className="text-[var(--ipp-secondary)] text-sm mt-3">Manage your partnerships</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[var(--ipp-text)] mb-1">Login</h1>
          <p className="text-sm text-[var(--ipp-secondary)] mb-6">
            We&apos;ll email a 6-digit code. No password needed.
          </p>
          <Suspense fallback={<p className="text-[var(--ipp-secondary)] text-sm">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-[var(--ipp-secondary)] mt-6">
          New here?{" "}
          <Link href="/apply#apply-form" className="text-[var(--ipp-primary)] underline underline-offset-4">
            Apply for a partnership
          </Link>
        </p>
      </div>
    </main>
  );
}
