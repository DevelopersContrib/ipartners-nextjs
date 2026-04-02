import Link from 'next/link';

interface FooterProps {
  domain?: string;
}

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://d2qcctj8epnr7y.cloudfront.net/images/2013/logo-Ipartner1.png';

export default function Footer({ domain = 'ipartner.com' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070B09] border-t border-[#1E2D25]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="iPartner" className="h-8 w-auto mb-4" />
            <p className="text-sm leading-relaxed text-[#5A6E62] max-w-xs">
              Creating structured partnerships to monetize and build the brands of the future.
            </p>
          </div>

          {/* Partnerships */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Partnerships</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/domain', label: 'Domain Partnerships' },
                { href: '/apps', label: 'App Partnerships' },
                { href: '/leaders', label: 'Leader Partnerships' },
                { href: '/product-service', label: 'Product/Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#5A6E62] hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1 group">
                    <span className="w-0 group-hover:w-2 h-px bg-green-500 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/domain/apply', label: 'Apply Now' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#5A6E62] hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1 group">
                    <span className="w-0 group-hover:w-2 h-px bg-green-500 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/terms', label: 'Terms of Use' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: `https://www.domaindirectory.com/policypage/cookiepolicy?domain=${domain}`, label: 'Cookie Policy', external: true },
              ].map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[#5A6E62] hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1 group">
                      <span className="w-0 group-hover:w-2 h-px bg-green-500 transition-all duration-200" />
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-[#5A6E62] hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1 group">
                      <span className="w-0 group-hover:w-2 h-px bg-green-500 transition-all duration-200" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E2D25] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3D5A48]">
          <p>&copy; 2013-{currentYear} Global Ventures. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a href="https://www.contrib.com" target="_blank" rel="noopener noreferrer" className="text-[#5A6E62] hover:text-green-400 transition-colors">
              Contrib
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
