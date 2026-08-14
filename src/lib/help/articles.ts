export type HelpCategory =
  | "getting-started"
  | "marketplace"
  | "applications"
  | "account"
  | "placements";

export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  category: HelpCategory;
  tags: string[];
  /** Plain-text body used for search + AI context. */
  body: string;
  related?: string[];
};

export const HELP_CATEGORIES: { id: HelpCategory; label: string; blurb: string }[] = [
  {
    id: "getting-started",
    label: "Getting started",
    blurb: "Sign in, navigate the portal, and find your first opportunity.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    blurb: "Discover brands, scores, and how matches work.",
  },
  {
    id: "applications",
    label: "Applications & deals",
    blurb: "Modes, statuses, and what happens after you apply.",
  },
  {
    id: "placements",
    label: "Placements & match",
    blurb: "Sponsor inventory and the AI Matchmaker quiz.",
  },
  {
    id: "account",
    label: "Account & support",
    blurb: "Profile, emails, and how to reach a human.",
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "welcome-to-the-portal",
    title: "Welcome to the iPartner portal",
    summary: "How the marketplace shell is organized and where to start.",
    category: "getting-started",
    tags: ["portal", "home", "navigation", "overview"],
    related: ["how-to-apply", "discover-opportunities"],
    body: `The partner portal is your workspace for finding and managing partnerships.

Key areas:
• Home — a feed of new matches, applications in flight, and active partnerships.
• Discover — browse brands across verticals and filter by partnership mode.
• Deals — a thin pipeline of your engagements by status (pending, approved, active, declined, lapsed).
• Buy placements — express sponsor interest in homepage, newsletter, and media inventory.
• AI Matchmaker — take the quiz (on the marketing site) then jump back into Discover.
• Profile — your identity, company, and recent partnerships.
• Help — this searchable guide plus Ask AI.

On phones, use the bottom tabs for Home, Discover, Deals, and Profile. Open the menu for Placements, Matchmaker, Help, and sign out.

Tip: Start on Discover or use Find opportunities from Home.`,
  },
  {
    slug: "sign-in-and-session",
    title: "Sign in and your session",
    summary: "Email codes, cookies, and staying signed in.",
    category: "getting-started",
    tags: ["login", "email", "code", "session", "password"],
    related: ["profile-and-company"],
    body: `iPartner uses passwordless email sign-in.

1. Go to /login and enter your email.
2. We send a one-time 6-digit code (via Amazon SES when configured).
3. Enter the code to create a signed session cookie (ipp_session).

Your identity is your email. If you already exist in the Contrib Members store, we load your name and company. New partners can still sign in before a Members row exists.

Sessions last about 30 days. Use Sign out from the sidebar, menu, or Profile page.

Never share your login codes. Admins use the same sign-in; access to /admin is controlled by an allowlist (ADMIN_EMAILS), not a separate password.`,
  },
  {
    slug: "discover-opportunities",
    title: "Discover partnership opportunities",
    summary: "Search, filter by vertical or mode, and open a brand.",
    category: "marketplace",
    tags: ["discover", "search", "vertical", "filter", "brand"],
    related: ["partnerscore-explained", "how-to-apply"],
    body: `Discover lists partnership opportunities across network verticals (for example Domains, SaaS, Media).

How to use it:
• Search by company or domain name (mobile has a dedicated search field; desktop uses the top bar).
• Filter by vertical chips (All verticals, or a specific vertical).
• Filter by mode chips (Sponsor, Builder, Operator, and others) to signal interest — the list still shows brands; applying with a mode pre-selects that track.
• Open View for the opportunity detail, or Apply to start an application.

Cards show PartnerScore when available, asset signals, and recent visitor stats when we have them.

Empty results usually mean a narrow search or vertical — clear filters or try another keyword.`,
  },
  {
    slug: "partnerscore-explained",
    title: "PartnerScore explained",
    summary: "What the score means and what it is not.",
    category: "marketplace",
    tags: ["partnerscore", "score", "traffic", "ranking"],
    related: ["discover-opportunities", "opportunity-detail"],
    body: `PartnerScore ranks brands for partnership fit using network signals such as traffic, demand, and asset value. Higher scores generally mean stronger partnership inventory.

On opportunity cards and detail pages you may also see:
• Visitors / 30d — unique visitor signal when available
• Asset signal — relative value indicator
• Network partners, leads, and offers counts

PartnerScore is not a personal credit score, KYC badge, or guarantee of approval. Personal verification badges and peer reviews are planned for a later phase.

If a brand shows a low or missing score, you can still apply — our team reviews applications in admin.`,
  },
  {
    slug: "opportunity-detail",
    title: "Opportunity detail page",
    summary: "Overview metrics and apply actions for a single brand.",
    category: "marketplace",
    tags: ["opportunity", "detail", "apply", "sponsor", "message"],
    related: ["how-to-apply", "partnership-modes"],
    body: `Each opportunity page shows the brand domain, vertical, PartnerScore, traffic and asset signals, category, and network demand stats.

Primary actions:
• Apply now — opens the apply flow for that domain.
• Sponsor interest — apply with mode=sponsor pre-selected.
• Message partner — opens a mailto to hello@ipartner.com (in-app messaging ships later).

On mobile, Apply and Message stick above the bottom navigation for quick access.

Messaging, contracts, and calendar booking are not live yet. Applying creates an engagement that the iPartner team reviews.`,
  },
  {
    slug: "how-to-apply",
    title: "How to apply for a partnership",
    summary: "From Discover or Create opportunity through review.",
    category: "applications",
    tags: ["apply", "application", "engagement", "pending"],
    related: ["partnership-modes", "deals-pipeline", "status-emails"],
    body: `You can start an application from:
• Discover or an opportunity page (domain often pre-filled)
• Create opportunity in the portal header
• /apply directly
• Buy placements → Register sponsor interest

Fill in your details and choose a partnership mode. Submitting creates an engagement (tracked in Deals) and may send a confirmation email when campaigns are enabled.

What happens next:
1. Status starts as pending (Under review).
2. Our team reviews in the admin dashboard.
3. Status moves to approved/active, declined, or later lapsed.
4. Lifecycle emails may notify you on those changes.

Important: Admin approval in iPartner is not the same as publishing a live widget on a domain — that still happens in the manage-app / VNOC side when relevant.`,
  },
  {
    slug: "partnership-modes",
    title: "Partnership modes",
    summary: "Sponsor, Builder, Operator, and the other tracks.",
    category: "applications",
    tags: ["mode", "sponsor", "builder", "operator", "referrer", "vendor"],
    related: ["how-to-apply", "buy-placements"],
    body: `Each application uses a mode that describes how you want to partner:

• Sponsor — pay for or underwrite placements, campaigns, and brand presence.
• Builder — equity-style / added-value building of a brand.
• Domain owner — you bring or control the domain asset.
• App partner — product or app integration.
• Operator — operate or lead growth of a property.
• Vendor — product or service provider.
• Referrer — distribution / affiliate-style introductions.

In Discover, mode filters highlight interest; when you apply with a mode selected, that track is preferred on the form.

Choose the mode that best matches what you can deliver. You can submit more than one application over time for different brands or modes.`,
  },
  {
    slug: "deals-pipeline",
    title: "Deals pipeline",
    summary: "Track engagements by pending, approved, active, declined, and lapsed.",
    category: "applications",
    tags: ["deals", "pipeline", "status", "crm"],
    related: ["how-to-apply", "status-emails"],
    body: `Deals is a thin status board — not a full CRM.

Columns / groups:
• pending — submitted, waiting on review
• approved — accepted (often shown as Active in labels)
• active — live partnership
• declined — not moving forward
• lapsed — previously active, no longer current

On mobile, swipe horizontally across status columns. On desktop, columns appear in a grid.

Use New application to open /apply. Full negotiation stages, contracts, and signatures arrive in a later phase — today status is the source of truth for where you stand.`,
  },
  {
    slug: "status-emails",
    title: "Status and campaign emails",
    summary: "Applied, approved, declined, active, and lapsed notifications.",
    category: "applications",
    tags: ["email", "campaign", "ses", "notification"],
    related: ["deals-pipeline", "sign-in-and-session"],
    body: `When lifecycle campaigns are enabled, iPartner can email you at key moments:
• applied — confirmation after you submit
• approved — your application was accepted
• declined — not moving forward
• active — partnership is live
• lapsed — partnership is no longer active

Emails send through Amazon SES from a verified identity (often members@contrib.com until a dedicated ipartner sender is verified).

If you do not receive mail, check spam, confirm the address on your profile/session, and ask an admin whether CAMPAIGN_EMAILS_ENABLED is on and SES is configured.

Admins can resend certain campaign emails from an engagement's detail page in /admin.`,
  },
  {
    slug: "buy-placements",
    title: "Buy placements",
    summary: "Homepage, newsletter, and media sponsorship interest.",
    category: "placements",
    tags: ["placements", "sponsor", "newsletter", "homepage", "checkout"],
    related: ["partnership-modes", "how-to-apply"],
    body: `Buy placements is where sponsors express interest in inventory such as:
• Homepage hero
• Newsletter sponsorship
• Podcast / media

Checkout is live for annual Bronze / Silver / Gold sponsorship via PayDirect (card or crypto). From Placements or the marketing pricing section, open checkout for a tier, or apply with mode=sponsor if you want a conversation first.

Live slot-level inventory booking (homepage hero, newsletter, podcast) is still guided — use apply or contact for custom packages beyond the three annual tiers.`,
  },
  {
    slug: "ai-matchmaker",
    title: "AI Matchmaker",
    summary: "Use the quiz to find fitting verticals and modes.",
    category: "placements",
    tags: ["match", "quiz", "ai", "recommend"],
    related: ["discover-opportunities", "partnership-modes"],
    body: `The AI Matchmaker page in the portal bridges you to the free match quiz on the marketing site (/match).

The quiz asks a few questions and points you toward verticals and partnership modes that fit. Afterward, open Discover to browse and apply.

Conversational prompts (ROI estimates, outreach drafts) are planned next. The current quiz is rule-based matching — still useful for orientation before you search brands.

Try prompts like: SaaS brands needing distribution, sites selling homepage placements, or AI startups looking for operators.`,
  },
  {
    slug: "profile-and-company",
    title: "Profile and company",
    summary: "What appears on Profile and how counts work.",
    category: "account",
    tags: ["profile", "company", "partnerships", "sign out"],
    related: ["sign-in-and-session", "deals-pipeline"],
    body: `Profile shows your display name, email, and company when we have them from Members or your local partner record.

Summary tiles:
• Partnerships — count of your engagements
• Active / approved — engagements in approved or active status

Below that is a list of recent partnerships with mode, scope (often a domain), and status.

Reviews and verification badges are not personal yet — PartnerScore applies to opportunities. Sign out is available here and in the shell menu.`,
  },
  {
    slug: "contact-human-support",
    title: "Contact human support",
    summary: "When Ask AI is not enough.",
    category: "account",
    tags: ["contact", "support", "email", "help"],
    related: ["welcome-to-the-portal", "status-emails"],
    body: `Use Ask AI in Help for how-to questions about the portal. For account issues, partnership negotiations, or anything sensitive, contact a human.

• Email: hello@ipartner.com
• Marketing contact form: /contact
• Opportunity pages include Message partner (mailto) for brand-specific notes

Include your signed-in email, the domain or deal in question, and what you already tried. Admins reviewing engagements may also reply from campaign or ops mail.

We do not offer phone support from inside the portal today.`,
  },
  {
    slug: "mobile-and-browsers",
    title: "Mobile and browser tips",
    summary: "Bottom tabs, drawers, and sticky actions.",
    category: "getting-started",
    tags: ["mobile", "responsive", "browser", "tabs"],
    related: ["welcome-to-the-portal"],
    body: `The portal is built for phones and desktops.

Mobile:
• Bottom tabs — Home, Discover, Deals, Profile
• Hamburger menu — full nav plus Admin (if allowlisted) and Sign out
• Discover filters scroll horizontally
• Deals columns snap horizontally
• Opportunity Apply bar sits above the tabs

Desktop:
• Left sidebar for all sections
• Search in the top bar
• Create opportunity always available

Use a modern browser (current Chrome, Safari, Firefox, Edge). If the menu will not close, navigate to another portal page — the drawer closes on route change.`,
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function articlesByCategory(category: HelpCategory): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === category);
}
