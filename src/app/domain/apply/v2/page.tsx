import type { Metadata } from "next";
import DomainApplyV2Form from "./domain-apply-v2-form";

export const metadata: Metadata = {
  title: "Apply for Domain Partnership (v2) - iPartner",
  description:
    "Apply to become a domain partner with iPartner. Complete the partnership application form."
};

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "ipartner.com";

export default function DomainApplyV2Page() {
  return (
    <div className="relative min-h-screen overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      {/* Layered background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[#030806]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.25),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(56,189,248,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[64px_64px]"
        aria-hidden
      />

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10 sm:mb-12 md:mb-14">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/90 mb-3 sm:mb-4">
            Partnerships
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight [text-balance">
            <span className="bg-linear-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Domain partnership
            </span>{" "}
            <span className="bg-linear-to-r from-emerald-300 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              application
            </span>
          </h1>
          <p className="text-[#5A6E62] sm:text-zinc-400 mt-3 sm:mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Complete the form to apply for a domain partnership with iPartner.
            Prefer the classic embed? See{" "}
            <a
              href="/domain/apply#apply-form"
              className="text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              the original application page
            </a>
            .
          </p>
        </header>

        <DomainApplyV2Form defaultDomain={DOMAIN} />
      </div>
    </div>
  );
}
