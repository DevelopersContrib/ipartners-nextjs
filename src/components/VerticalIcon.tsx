/** Simple line icons for vertical category cards. */
export default function VerticalIcon({
  slug,
  className = "w-7 h-7",
}: {
  slug: string;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    "aria-hidden": true as const,
  };
  const sw = 1.75;

  switch (slug) {
    case "ai":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          <circle cx="12" cy="12" r="3.5" strokeWidth={sw} />
        </svg>
      );
    case "domains":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" strokeWidth={sw} />
          <path strokeWidth={sw} d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
        </svg>
      );
    case "referrals":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M16 8a3 3 0 11-3-3M8 16a3 3 0 100 6 3 3 0 000-6zM13 8l-3 5M11 19l5-8" />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "payments":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" strokeWidth={sw} />
          <path strokeWidth={sw} strokeLinecap="round" d="M2.5 10h19M7 15h4" />
        </svg>
      );
    case "health":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "real-estate":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
      );
    case "travel":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.5l8 4.5-4.5 2.5L21 16.5l-2 1-6.5-4.5-2.5 4.5-1.5-.8 1.2-5.2L4 8.5l1-2 5.5 1.5L10.5 3.5z" />
        </svg>
      );
    case "food":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" d="M8 3v8a2 2 0 002 2v8M8 3c0 2.5-2 3-2 5.5S8 11 8 11M16 3v18M16 3c2 0 3 2 3 4s-1 3-3 4" />
        </svg>
      );
    case "education":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-5 9 5-9 5-9-5zM7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5" />
        </svg>
      );
    case "finance":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M4 19V9l4 3 4-6 4 4 4-5v14H4z" />
        </svg>
      );
    case "media":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={sw} />
          <path strokeWidth={sw} strokeLinecap="round" d="M8 15l2.5-3 2 2L16 9" />
        </svg>
      );
    case "sports":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" strokeWidth={sw} />
          <path strokeWidth={sw} d="M12 3c2.5 3 3.5 5.5 3.5 9S14.5 18 12 21M12 3c-2.5 3-3.5 5.5-3.5 9S9.5 18 12 21M3.5 9.5h17M3.5 14.5h17" />
        </svg>
      );
    case "legal":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 7h10M6 21h12M8 7l-3 7h6L8 7zM16 7l-3 7h6l-3-7z" />
        </svg>
      );
    case "crypto":
      return (
        <svg {...common}>
          <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M9 7h5.5a2.5 2.5 0 010 5H9m0 0h6a2.5 2.5 0 010 5H9m0-5V7m0 5v5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth={sw} />
          <path strokeWidth={sw} strokeLinecap="round" d="M8 12h8M12 8v8" />
        </svg>
      );
  }
}
