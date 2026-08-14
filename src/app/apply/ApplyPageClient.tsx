"use client";

import { useRouter } from "next/navigation";
import ApplicationForm from "@/components/ApplicationForm";
import EngagementModePicker from "@/components/EngagementModePicker";
import type { PartnershipType } from "@/lib/types";
import {
  MODE_LABELS,
  type EngagementMode,
} from "@/lib/engagement-modes";
import { sponsorCheckoutHref } from "@/lib/sponsor-pricing";
import Link from "next/link";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "ipartner.com";

function typeFromMode(mode: EngagementMode): PartnershipType {
  switch (mode) {
    case "domain_owner":
      return "domain";
    case "app":
      return "apps";
    case "operator":
      return "leaders";
    case "vendor":
      return "product-service";
    default:
      return "domain";
  }
}

export default function ApplyPageClient({
  initialEmail = "",
  initialType,
  initialDomain,
  initialProfile,
  signedIn = false,
  engagementMode,
  vertical,
  tier,
}: {
  initialEmail?: string;
  initialType?: PartnershipType;
  initialDomain?: string;
  initialProfile?: {
    firstname?: string;
    lastname?: string;
    country?: string;
    industry?: string;
  };
  signedIn?: boolean;
  engagementMode?: EngagementMode;
  vertical?: string;
  tier?: string;
}) {
  const router = useRouter();
  const isSponsor = engagementMode === "sponsor";
  const partnershipType =
    initialType ?? (engagementMode ? typeFromMode(engagementMode) : "domain");

  const selectMode = (mode: EngagementMode) => {
    const q = new URLSearchParams();
    q.set("mode", mode);
    if (vertical) q.set("vertical", vertical);
    if (tier) q.set("tier", tier);
    if (initialDomain) q.set("domain", initialDomain);
    router.push(`/apply?${q.toString()}`);
  };

  return (
    <div className="py-16 px-4 bg-[var(--ipp-bg)] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ipp-text)]">
            {!engagementMode
              ? "How do you want to partner?"
              : isSponsor
                ? "Sponsor a category"
                : `Apply as ${MODE_LABELS[engagementMode]}`}
          </h1>
          <p className="text-[var(--ipp-secondary)] mt-3 max-w-lg mx-auto">
            {!engagementMode
              ? "Pick a path — sponsor a vertical, build a domain, or join as referrer, vendor, or operator."
              : isSponsor
                ? "Checkout is live for Bronze / Silver / Gold, or apply here and we follow up."
                : "Complete the application — we review every submission."}
          </p>
          {engagementMode && (
            <p className="text-sm text-[var(--ipp-secondary)] mt-3">
              Mode:{" "}
              <span className="text-[var(--ipp-accent)] font-medium">
                {MODE_LABELS[engagementMode]}
              </span>
              {vertical ? ` · ${vertical}` : ""}
              {tier ? ` · ${tier}` : ""}
              {" · "}
              <button
                type="button"
                onClick={() => router.push("/apply")}
                className="underline underline-offset-2 hover:text-[var(--ipp-text)]"
              >
                Change
              </button>
            </p>
          )}
          {signedIn && initialEmail && (
            <p className="text-sm text-[var(--ipp-secondary)] mt-4">
              Signed in as{" "}
              <span className="text-[var(--ipp-text)] font-medium">
                {initialEmail}
              </span>
            </p>
          )}
        </div>

        <div id="apply-form">
          {!engagementMode ? (
            <EngagementModePicker onChange={selectMode} />
          ) : (
            <>
              {isSponsor && (
                <p className="mb-6 text-center text-sm text-[var(--ipp-secondary)]">
                  Ready to pay now?{" "}
                  <Link
                    href={sponsorCheckoutHref({
                      tier: (tier || "bronze").toLowerCase(),
                      vertical,
                    })}
                    className="font-semibold text-[var(--ipp-text)] underline underline-offset-2"
                  >
                    Go to checkout
                  </Link>
                </p>
              )}
              <ApplicationForm
                partnershipType={partnershipType}
                domain={initialDomain || DOMAIN}
                initialEmail={initialEmail}
                initialProfile={initialProfile}
                engagementMode={engagementMode}
                vertical={vertical}
                tier={tier}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
