import { NextRequest, NextResponse } from "next/server";
import {
  IPP_REF_COOKIE,
  IPP_REF_MAX_AGE_SEC,
  normalizeInboundRef,
  readRefFromSearchParams,
} from "@/lib/inbound-platforms";

const subdomainMap: Record<string, string> = {
  domain: "/domain",
  apps: "/apps",
  leaders: "/leaders",
  "product-service": "/product-service",
};

function withRefCookie(res: NextResponse, host: string) {
  res.cookies.set(IPP_REF_COOKIE, host, {
    maxAge: IPP_REF_MAX_AGE_SEC,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Extract subdomain: "domain.ipartner.com" -> "domain"
  const subdomain = hostname
    .replace(".ipartner.com", "")
    .replace(".ipartners.com", "")
    .replace(":3000", ""); // dev mode

  // If this is a known subdomain, redirect to path-based route
  if (subdomain in subdomainMap) {
    const path = request.nextUrl.pathname;
    const targetPath = subdomainMap[subdomain];

    if (path.startsWith(targetPath)) {
      const res = NextResponse.next();
      const ref = readRefFromSearchParams(request.nextUrl.searchParams);
      if (ref) withRefCookie(res, ref);
      return res;
    }

    const url = new URL(
      `https://ipartner.com${targetPath}${path === "/" ? "" : path}`,
    );
    url.search = request.nextUrl.search;
    const res = NextResponse.redirect(url, 301);
    const ref = readRefFromSearchParams(request.nextUrl.searchParams);
    if (ref) withRefCookie(res, ref);
    return res;
  }

  const res = NextResponse.next();

  // Catch ?ref= / ?from= / utm_source=
  let ref = readRefFromSearchParams(request.nextUrl.searchParams);

  // Catch /from/{platform} clean URLs
  if (!ref) {
    const m = request.nextUrl.pathname.match(/^\/from\/([^/]+)\/?$/);
    if (m?.[1]) ref = normalizeInboundRef(decodeURIComponent(m[1]));
  }

  if (ref) withRefCookie(res, ref);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|img/).*)"],
};
