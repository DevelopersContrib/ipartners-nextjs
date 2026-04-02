import { NextRequest, NextResponse } from 'next/server';

const subdomainMap: Record<string, string> = {
  'domain': '/domain',
  'apps': '/apps',
  'leaders': '/leaders',
  'product-service': '/product-service',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract subdomain: "domain.ipartner.com" -> "domain"
  const subdomain = hostname
    .replace('.ipartner.com', '')
    .replace('.ipartners.com', '')
    .replace(':3000', ''); // dev mode

  // If this is a known subdomain, redirect to path-based route
  if (subdomain in subdomainMap) {
    const path = request.nextUrl.pathname;
    const targetPath = subdomainMap[subdomain];

    // Don't redirect if already on the correct path
    if (path.startsWith(targetPath)) return NextResponse.next();

    // Build redirect URL to main domain with path
    const url = new URL(`https://ipartner.com${targetPath}${path === '/' ? '' : path}`);
    url.search = request.nextUrl.search;

    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on page routes, not API/static
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img/).*)'],
};
