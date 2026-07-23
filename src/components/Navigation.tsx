'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png';

const navLinks = [
  { href: '/verticals', label: 'Verticals', mobileLabel: 'Browse verticals' },
  { href: '/match', label: 'Match', mobileLabel: 'Free partner match' },
  { href: '/apply?mode=sponsor', label: 'Sponsor', mobileLabel: 'Sponsor a category' },
  { href: '/apply', label: 'Partner', mobileLabel: 'Partner on a domain' },
  { href: '/referrals', label: 'Referrals', mobileLabel: 'Referral program' },
  { href: '/about', label: 'About', mobileLabel: 'About Us' },
  { href: '/contact', label: 'Contact', mobileLabel: 'Contact Us' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    const path = href.split('?')[0] || href;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? 'bg-[var(--ipp-bg)]/95 backdrop-blur-md border-[var(--border)] shadow-sm' : 'bg-[var(--ipp-bg)] border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]">
          <div className="flex justify-between h-14 sm:h-16 lg:h-18">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_URL} alt="iPartner" className="h-8 sm:h-9 w-auto" />
              </Link>
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-[var(--ipp-primary)] bg-white'
                      : 'text-[var(--ipp-secondary)] hover:text-[var(--ipp-text)] hover:bg-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="ml-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--ipp-accent)] text-[var(--ipp-text)] hover:brightness-105 transition"
              >
                Login
              </Link>
            </div>

            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-[var(--ipp-secondary)] hover:bg-white/70"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col gap-1.5 items-center">
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-[var(--ipp-text)]/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
            <span className="text-lg font-bold text-[var(--ipp-text)]">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[var(--ipp-secondary)]"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium ${
                  isActive(link.href) ? 'text-[var(--ipp-primary)] bg-[var(--ipp-bg)]' : 'text-[var(--ipp-text)]'
                }`}
              >
                {link.mobileLabel}
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] space-y-2 bg-white">
            <Link
              href="/login"
              className="flex items-center justify-center w-full min-h-12 bg-[var(--ipp-accent)] text-[var(--ipp-text)] py-3 rounded-xl text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/apply"
              className="flex items-center justify-center w-full min-h-12 bg-[var(--ipp-primary)] text-white py-3 rounded-xl text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Apply
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
