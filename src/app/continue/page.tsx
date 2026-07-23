import type { Metadata } from "next";
import Link from "next/link";
import { verifyHandoff } from "@/lib/handoff";
import ContinueForm from "./ContinueForm";

export const dynamic = "force-dynamic";

const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png";

export const metadata: Metadata = {
  title: "Continue your application — iPartner",
  robots: { index: false, follow: false },
};

/**
 * Landing point for the DomainDirectory hand-off.
 *   /continue?token=<signed>
 *
 * We only VERIFY here (signature + expiry) to render the confirmation.
 * The nonce is burned and the session created on the user's explicit click —
 * never on page load — so a leaked/prefetched URL can't become a session.
 */
export default async function ContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? verifyHandoff(token) : ({ ok: false, reason: "malformed" } as const);

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-10 sm:h-12 w-auto" />
          </Link>
        </div>
        <div className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );

  if (!result.ok) {
    const copy =
      result.reason === "expired"
        ? "That link has expired — they're only valid for a short time for security."
        : result.reason === "not_configured"
          ? "Hand-off links aren't enabled yet."
          : "We couldn't verify that link.";

    return shell(
      <>
        <h1 className="text-xl font-bold text-white mb-2">Let&apos;s get you signed in</h1>
        <p className="text-sm text-[#8B9E93] mb-6">{copy} You can sign in with your email instead — it takes about ten seconds.</p>
        <Link
          href="/login"
          className="block w-full text-center px-4 py-3 rounded-xl bg-white text-[#0A0F0D] font-semibold"
        >
          Sign in with email
        </Link>
      </>,
    );
  }

  return shell(
    <>
      <h1 className="text-xl font-bold text-white mb-1">Continue your application</h1>
      <p className="text-sm text-[#5A6E62] mb-6">
        We picked up where you left off on DomainDirectory — no password needed.
      </p>
      <ContinueForm
        token={token!}
        email={result.payload.email}
        domain={result.payload.domain}
        type={result.payload.type}
      />
    </>,
  );
}
