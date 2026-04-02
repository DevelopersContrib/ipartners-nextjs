import Navigation from './Navigation';
import ForSaleBanner from './ForSaleBanner';

interface HeaderProps {
  forsale?: string;
  forsaletext?: string;
  domain?: string;
  affiliateLink?: string;
}

export default function Header({ domain = 'ipartner.com', forsale, forsaletext, affiliateLink }: HeaderProps) {
  return (
    <header className="relative">
      {forsale === '1' && (
        <ForSaleBanner domain={domain} text={forsaletext} affiliateLink={affiliateLink} />
      )}
      <Navigation />
    </header>
  );
}
