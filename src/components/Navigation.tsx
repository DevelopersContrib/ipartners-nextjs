'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png';

const navLinks = [
  { href: '/domain', label: 'Domains', mobileLabel: 'Domain Partnerships' },
  { href: '/apps', label: 'Apps', mobileLabel: 'App Partnerships' },
  { href: '/leaders', label: 'Leaders', mobileLabel: 'Leader Partnerships' },
  { href: '/product-service', label: 'Products', mobileLabel: 'Products/Services' },
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
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`bg-[#0A0F0D]/95 backdrop-blur-md sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? 'border-[#1E2D25] shadow-lg shadow-black/20' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-18">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_URL}
                  alt="iPartner"
                  className="h-8 sm:h-9 w-auto"
                />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-green-500 rounded-full" />
                  )}
                </Link>
              ))}
              <Link
                href="/domain/apply"
                className="ml-3 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-500 active:bg-green-700 transition-all shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-500/25"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col gap-1.5 items-center">
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#111916] shadow-2xl shadow-black/50 transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 h-16 border-b border-[#1E2D25]">
            <span className="text-lg font-bold text-white">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-green-400 bg-green-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.mobileLabel}
                {isActive(link.href) && (
                  <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1E2D25] bg-[#111916]">
            <Link
              href="/domain/apply"
              className="flex items-center justify-center w-full bg-green-600 text-white py-3.5 rounded-xl text-base font-semibold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
              onClick={() => setMobileOpen(false)}
            >
              Apply for Partnership
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
