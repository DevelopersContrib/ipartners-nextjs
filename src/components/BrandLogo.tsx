"use client";

import { useEffect, useState } from "react";

/** brandidentity.com resolves → CDN logo (302). Plain img follows redirects reliably. */
export function brandLogoUrl(domain: string): string {
  const host = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  return `https://www.brandidentity.com/logo/${encodeURIComponent(host)}`;
}

export default function BrandLogo({
  domain,
  size = 40,
  className = "",
}: {
  domain: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const label = domain.replace(/\.[a-z]{2,}$/i, "").slice(0, 2).toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep SSR + first client paint identical (always the <img>).
  if (mounted && failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-[var(--ipp-primary)]/10 text-[10px] font-bold text-[var(--ipp-primary)] ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {label}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandLogoUrl(domain)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-contain rounded-lg bg-white ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
