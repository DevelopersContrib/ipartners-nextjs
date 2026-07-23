"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  domainHref,
  formatDomainDisplay,
  normalizeDomainHost,
} from "@/lib/vertical-brands";

/** Exact domain link; ?ref= uses the current page hostname. */
export default function DomainReferralLink({
  domain,
  className = "",
  children,
}: {
  domain: string;
  className?: string;
  children?: ReactNode;
}) {
  const base = domainHref(domain);
  const [href, setHref] = useState(base);

  useEffect(() => {
    const ref = normalizeDomainHost(window.location.hostname);
    if (!ref) return;
    setHref(`${base}?ref=${encodeURIComponent(ref)}`);
  }, [base]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children ?? formatDomainDisplay(domain)}
    </a>
  );
}
