import Link from "next/link";
import { logout } from "@/lib/auth-actions";

const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--ipp-bg)] text-[var(--ipp-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-7 w-auto" />
            <span className="rounded-md bg-[var(--ipp-primary)]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ipp-primary)]">
              Admin
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 sm:flex" aria-label="Admin">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ipp-text)] hover:bg-[var(--ipp-bg)]"
            >
              Engagements
            </Link>
            <Link
              href="/admin?status=pending&mode=sponsor"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ipp-secondary)] hover:bg-[var(--ipp-bg)] hover:text-[var(--ipp-text)]"
            >
              Sponsors
            </Link>
            <Link
              href="/admin/engagement/new"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ipp-secondary)] hover:bg-[var(--ipp-bg)] hover:text-[var(--ipp-text)]"
            >
              New
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/portal"
              className="hidden h-9 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--ipp-secondary)] hover:bg-[var(--ipp-bg)] sm:inline-flex"
            >
              Portal
            </Link>
            <Link
              href="/"
              className="hidden h-9 items-center rounded-lg px-2 text-xs font-medium text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)] md:inline-flex"
            >
              Site
            </Link>
            <span
              className="hidden max-w-[10rem] truncate text-xs text-[var(--ipp-secondary)] lg:inline"
              title={email}
            >
              {email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--ipp-text)] hover:bg-[var(--ipp-bg)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          className="flex gap-1 overflow-x-auto border-t border-[var(--border)] px-3 py-2 sm:hidden"
          aria-label="Admin mobile"
        >
          <Link
            href="/admin"
            className="shrink-0 rounded-lg bg-[var(--ipp-bg)] px-3 py-2 text-xs font-semibold"
          >
            Engagements
          </Link>
          <Link
            href="/admin?status=pending&mode=sponsor"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ipp-secondary)]"
          >
            Sponsors
          </Link>
          <Link
            href="/admin/engagement/new"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ipp-secondary)]"
          >
            New
          </Link>
          <Link
            href="/portal"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ipp-secondary)]"
          >
            Portal
          </Link>
        </nav>
      </header>

      {children}
    </div>
  );
}
