"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/auth-actions";

const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png";

const NAV = [
  { href: "/portal", label: "Home", short: "Home", exact: true },
  { href: "/portal/discover", label: "Discover", short: "Discover" },
  { href: "/portal/deals", label: "Deals", short: "Deals" },
  { href: "/portal/placements", label: "Buy placements", short: "Placements" },
  { href: "/portal/match", label: "AI Matchmaker", short: "Match" },
  { href: "/portal/help", label: "Help", short: "Help" },
  { href: "/portal/profile", label: "Profile", short: "Profile" },
] as const;

const MOBILE_TABS = [
  NAV[0],
  NAV[1],
  NAV[2],
  NAV[6],
] as const;

export type PortalShellSession = {
  email: string;
  label: string;
  isAdmin: boolean;
};

export default function PortalShell({
  session,
  children,
}: {
  session: PortalShellSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const discoverQuery =
    pathname === "/portal/discover" || pathname.startsWith("/portal/discover/")
      ? searchParams.get("q") ?? ""
      : "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navClass = (href: string, exact?: boolean) =>
    active(href, exact)
      ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-200/80"
      : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900";

  return (
    <div className="min-h-[100dvh] bg-[#f7f7f5] text-zinc-900 antialiased">
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6">
          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span className="flex w-4 flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-full rounded-full bg-current" />
              <span className="block h-0.5 w-full rounded-full bg-current" />
              <span className="block h-0.5 w-3 rounded-full bg-current" />
            </span>
          </button>

          <Link href="/portal" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-7 w-auto sm:h-8" />
          </Link>

          <form
            action="/portal/discover"
            className="hidden min-w-0 flex-1 sm:flex sm:max-w-md sm:mx-4 lg:mx-8"
          >
            <label className="sr-only" htmlFor="portal-search">
              Search
            </label>
            <input
              id="portal-search"
              name="q"
              type="search"
              key={discoverQuery}
              defaultValue={discoverQuery}
              placeholder="Search companies, domains…"
              className="h-10 w-full min-w-0 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-300 focus:bg-white focus:ring-4 focus:ring-zinc-900/[0.04]"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/apply"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] sm:px-3.5 sm:text-sm"
            >
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create opportunity</span>
            </Link>
            <Link
              href="/portal/help"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
              title="Help center"
              aria-label="Help center"
            >
              ?
            </Link>
            {session.isAdmin && (
              <Link
                href="/admin"
                className="hidden h-10 items-center rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 md:inline-flex"
              >
                Admin
              </Link>
            )}
            <Link
              href="/portal/profile"
              className="hidden h-10 max-w-[10rem] items-center truncate rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 sm:inline-flex"
              title={session.email}
            >
              {session.label}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 flex-col border-r border-zinc-200/70 bg-[#f7f7f5] px-3 py-5 lg:flex xl:w-60">
          <nav className="space-y-0.5" aria-label="Marketplace">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${navClass(
                  item.href,
                  "exact" in item ? item.exact : false,
                )}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t border-zinc-200/70 pt-4 px-1">
            <p className="truncate text-[11px] text-zinc-400" title={session.email}>
              {session.email}
            </p>
            <Link
              href="/"
              className="block text-xs font-medium text-zinc-500 transition hover:text-zinc-800"
            >
              ← Marketing site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!open}
        >
          <button
            type="button"
            className={`absolute inset-0 bg-zinc-900/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-4 pt-[env(safe-area-inset-top)]">
              <span className="text-sm font-semibold text-zinc-900">Menu</span>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Marketplace">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-3 text-sm font-medium ${
                    active(item.href, "exact" in item ? item.exact : false)
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {session.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-zinc-700"
                >
                  Admin
                </Link>
              )}
            </nav>
            <div className="space-y-3 border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <p className="truncate text-xs text-zinc-500">{session.email}</p>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-800"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl lg:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {MOBILE_TABS.map((item) => {
            const isOn = active(item.href, "exact" in item ? item.exact : false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition ${
                  isOn ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${isOn ? "bg-zinc-900" : "bg-transparent"}`}
                  aria-hidden
                />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
