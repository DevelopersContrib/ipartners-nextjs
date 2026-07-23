import Link from 'next/link';
import DomainReferralLink from '@/components/DomainReferralLink';
import ReferralScript from '@/components/ReferralScript';

interface FooterProps {
  domain?: string;
}

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png';

const NETWORK = [
  'contrib.com',
  'vnoc.com',
  'agentdao.com',
  'referrals.com',
  'domaindirectory.com',
];

export default function Footer({ domain = 'ipartner.com' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[var(--border)]">
      <ReferralScript />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-8 w-auto mb-4" />
            <p className="text-sm leading-relaxed text-[var(--ipp-secondary)] max-w-xs">
              Partner across 19,211 domains — sponsor a vertical or build with equity.
            </p>
          </div>

          <div>
            <h4 className="text-[var(--ipp-text)] text-sm font-semibold uppercase tracking-wider mb-4">
              Partner
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/verticals" className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                  Browse verticals
                </Link>
              </li>
              <li>
                <Link href="/match" className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                  Free partner match
                </Link>
              </li>
              <li>
                <Link href="/apply?mode=sponsor" className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                  Sponsor a category
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                  Partner on a domain
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--ipp-text)] text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/terms', label: 'Terms' },
                { href: '/privacy', label: 'Privacy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`https://www.domaindirectory.com/policypage/cookiepolicy?domain=${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)]"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--ipp-text)] text-sm font-semibold uppercase tracking-wider mb-4">
              Network
            </h4>
            <ul className="space-y-3 text-sm">
              {NETWORK.map((host) => (
                <li key={host}>
                  <DomainReferralLink
                    domain={host}
                    className="text-[var(--ipp-secondary)] hover:text-[var(--ipp-accent)] font-mono text-xs sm:text-sm"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ipp-secondary)]">
          <p>&copy; 2013-{currentYear} Global Ventures. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a href="https://www.contrib.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ipp-accent)]">
              Contrib
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
