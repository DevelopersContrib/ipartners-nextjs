interface ForSaleBannerProps {
  domain: string;
  text?: string;
  affiliateLink?: string;
}

export default function ForSaleBanner({ domain, text, affiliateLink }: ForSaleBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-center py-2.5 px-4">
      <p className="text-sm font-medium text-gray-900">
        {text || `${domain} is available!`}{' '}
        {affiliateLink && (
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:text-blue-800 transition-colors"
          >
            Click here for details
          </a>
        )}
      </p>
    </div>
  );
}
