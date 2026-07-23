"use client";

import { useEffect } from "react";

/**
 * Referrals.com tracker — data-domain must be the exact browsing hostname
 * (e.g. ipartner.com), not a hardcoded/env alias.
 */
export default function ReferralScript() {
  useEffect(() => {
    const hostname = window.location.hostname;
    if (!hostname) return;

    const existing = document.querySelector(
      'script[src="https://www.referrals.com/referral.js"]',
    );
    if (existing) {
      existing.setAttribute("data-domain", hostname);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.referrals.com/referral.js";
    script.async = true;
    script.setAttribute("data-domain", hostname);
    document.body.appendChild(script);
  }, []);

  return null;
}
