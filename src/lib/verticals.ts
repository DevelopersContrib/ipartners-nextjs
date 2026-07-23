/**
 * Curated partnership verticals — SEO pages, homepage, search, and match quiz.
 * Pexels images are fixed CDN URLs with photographer attribution (no API key).
 */

export type VerticalImage = {
  src: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
};

export type Vertical = {
  slug: string;
  name: string;
  blurb: string;
  story: string;
  keywords: string[];
  domains: string[];
  image: VerticalImage;
  /** Engagement modes this vertical suits best */
  suitedModes: Array<
    "sponsor" | "builder" | "domain_owner" | "app" | "operator" | "vendor" | "referrer"
  >;
};

function pexels(
  id: number,
  alt: string,
  photographer: string,
  photographerPath: string,
): VerticalImage {
  return {
    src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`,
    alt,
    photographer,
    photographerUrl: `https://www.pexels.com/${photographerPath}`,
  };
}

export const VERTICALS: Vertical[] = [
  {
    slug: "ai",
    name: "AI & Agents",
    blurb: "Where autonomous products and agent infrastructure get discovered.",
    story:
      "The next wave of software doesn’t wait for a click — it acts. This vertical gathers the premium names where builders, operators, and sponsors meet around agent infrastructure, autonomous products, and AI-native ventures. If you want your brand beside the words people already associate with intelligent systems, start here.",
    keywords: ["ai", "agents", "automation", "llm", "machine learning", "autonomous", "agentdao"],
    domains: ["agentdao.com", "agentbank.com", "vnoc.com", "ventureos.com"],
    image: pexels(8386440, "Abstract digital technology and AI visuals", "Google DeepMind", "@googledeepmind"),
    suitedModes: ["sponsor", "builder", "app", "operator"],
  },
  {
    slug: "domains",
    name: "Domains & Brands",
    blurb: "Premium names people already type — inventory and marketplace gravity.",
    story:
      "Great brands begin with a name people remember and type. Our domains vertical is the shelf of category-defining URLs — marketplaces, directories, and flagship properties that already carry search intent. Partners here help unlock inventory, storytelling, and monetization around premium digital real estate.",
    keywords: ["domains", "brands", "dns", "marketplace", "premium", "naming", "directory"],
    domains: ["domaindirectory.com", "ipartner.com", "contrib.com"],
    image: pexels(3184291, "Team collaborating on brand strategy", "fauxels", "@fauxels"),
    suitedModes: ["sponsor", "builder", "domain_owner", "referrer"],
  },
  {
    slug: "referrals",
    name: "Growth & Referrals",
    blurb: "Distribution rails for partners who send traffic and earn.",
    story:
      "Distribution is the hardest product to build. This vertical is for affiliates, community leaders, and growth operators who turn introductions into revenue. Sit next to the rails that already measure referrals — and earn when you move attention across the network.",
    keywords: ["referrals", "affiliate", "growth", "distribution", "traffic", "partners"],
    domains: ["referrals.com", "contrib.com"],
    image: pexels(3183150, "People networking and sharing ideas", "fauxels", "@fauxels"),
    suitedModes: ["referrer", "sponsor", "builder"],
  },
  {
    slug: "services",
    name: "Local & Services",
    blurb: "Category brands that own high-intent service searches.",
    story:
      "When someone needs a plumber, a remodel, or a trusted local pro, they type the category — not a brand they’ve never heard of. Local & Services collects those high-intent names. Sponsors get category presence; builders and operators turn search demand into booked work.",
    keywords: ["local", "services", "handyman", "home", "trades", "contractors"],
    domains: ["handyman.com"],
    image: pexels(1249611, "Skilled tradesperson at work", "Pixabay", "@pixabay"),
    suitedModes: ["sponsor", "builder", "operator", "vendor"],
  },
  {
    slug: "payments",
    name: "Payments",
    blurb: "Settlement and payout surfaces for modern partner economies.",
    story:
      "Partnerships stall when money is unclear. The payments vertical focuses on settlement, payouts, and the trust layer between brands and contributors. Ideal for sponsors who want category association with modern money movement — and builders who improve how partners get paid.",
    keywords: ["payments", "payouts", "fintech", "settlement", "billing", "checkout"],
    domains: ["paydirect.com"],
    image: pexels(4968391, "Digital payment and finance interface", "Photo By: Kaboompics.com", "@kaboompics"),
    suitedModes: ["sponsor", "builder", "app", "vendor"],
  },
  {
    slug: "health",
    name: "Health & Wellness",
    blurb: "Trusted category names for care, recovery, and everyday wellness.",
    story:
      "Health decisions start with trust. This vertical groups premium names that signal care, recovery, and wellness — spaces where sponsors want responsible adjacency and operators can build content, tools, and services people return to.",
    keywords: ["health", "wellness", "care", "fitness", "medical", "recovery"],
    domains: ["contrib.com"],
    image: pexels(1092730, "Fresh wellness and healthy lifestyle", "jane doan", "@jane-doan"),
    suitedModes: ["sponsor", "builder", "operator", "vendor"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    blurb: "Property, place, and the digital front doors buyers already trust.",
    story:
      "Real estate is local, emotional, and search-driven. Our real-estate vertical pairs category domains with partners who understand listings, neighborhoods, and long-cycle trust. Sponsors get presence where intent is highest; builders create the experiences that convert browsers into buyers.",
    keywords: ["real estate", "property", "homes", "housing", "listings", "mortgage"],
    domains: ["contrib.com", "domaindirectory.com"],
    image: pexels(1396122, "Modern home exterior at dusk", "Expect Best", "@expectbest"),
    suitedModes: ["sponsor", "builder", "domain_owner", "referrer"],
  },
  {
    slug: "travel",
    name: "Travel & Hospitality",
    blurb: "Names that capture wanderlust and trip-planning intent.",
    story:
      "Travel brands win when they own the moment someone dreams of leaving. This vertical highlights domains tied to destinations, stays, and experiences. Partners here craft guides, booking flows, and sponsorships that meet travelers early in the journey.",
    keywords: ["travel", "hospitality", "tourism", "hotels", "vacation", "destinations"],
    domains: ["contrib.com"],
    image: pexels(346885, "Airplane wing above the clouds", "Pixabay", "@pixabay"),
    suitedModes: ["sponsor", "builder", "referrer", "vendor"],
  },
  {
    slug: "food",
    name: "Food & Dining",
    blurb: "Culinary brands and category URLs with everyday demand.",
    story:
      "Food is daily habit and cultural identity. The food vertical gathers names that sit beside recipes, restaurants, delivery, and culinary media. Sponsors and vendors find a hungry audience; builders turn appetite into lasting brand systems.",
    keywords: ["food", "dining", "restaurants", "recipes", "culinary", "delivery"],
    domains: ["contrib.com"],
    image: pexels(1640777, "Fresh prepared food on a table", "Ella Olsson", "@ellaolsson"),
    suitedModes: ["sponsor", "vendor", "builder", "referrer"],
  },
  {
    slug: "education",
    name: "Education & Learning",
    blurb: "Knowledge brands for courses, skills, and lifelong learning.",
    story:
      "Learning never stopped being a growth market — it just moved online. Education & Learning is for course creators, mentors, and sponsors who want adjacency to skill-building. Premium names here signal authority before a single lesson loads.",
    keywords: ["education", "learning", "courses", "skills", "training", "tutoring"],
    domains: ["contrib.com", "vnoc.com"],
    image: pexels(256541, "Open books and learning materials", "Pixabay", "@pixabay"),
    suitedModes: ["sponsor", "builder", "operator", "app"],
  },
  {
    slug: "finance",
    name: "Finance & Investing",
    blurb: "Category gravity for money, markets, and long-term trust.",
    story:
      "Finance is won on clarity and credibility. This vertical hosts names associated with markets, investing, and money decisions. Sponsors looking for serious category presence — and builders who can explain complexity simply — belong here.",
    keywords: ["finance", "investing", "markets", "wealth", "banking", "money"],
    domains: ["paydirect.com", "contrib.com"],
    image: pexels(210600, "Financial charts and market data", "Pixabay", "@pixabay"),
    suitedModes: ["sponsor", "builder", "operator", "app"],
  },
  {
    slug: "media",
    name: "Media & Content",
    blurb: "Publishing surfaces where stories and audiences meet.",
    story:
      "Attention compounds on the right URL. Media & Content collects domains built for stories, creators, and branded entertainment. Partners help program audiences; sponsors show up where culture is already gathering.",
    keywords: ["media", "content", "publishing", "creators", "news", "stories"],
    domains: ["contrib.com", "vnoc.com"],
    image: pexels(1181467, "Creative workspace with camera and laptop", "Startup Stock Photos", "@startupstockphotos"),
    suitedModes: ["sponsor", "builder", "app", "referrer"],
  },
  {
    slug: "sports",
    name: "Sports & Fitness",
    blurb: "Performance brands for fans, athletes, and active lifestyles.",
    story:
      "Sports communities are loyal and loud. This vertical is for partners who activate fandom, training, and outdoor energy around category-defining names. Sponsorships and builder roles both thrive when the audience already cares.",
    keywords: ["sports", "fitness", "athletes", "training", "outdoors", "fans"],
    domains: ["contrib.com"],
    image: pexels(2294361, "Athlete training with kettlebell", "Victor Freitas", "@victorfreitas"),
    suitedModes: ["sponsor", "builder", "referrer", "vendor"],
  },
  {
    slug: "legal",
    name: "Legal & Professional",
    blurb: "Authority names for counsel, compliance, and B2B trust.",
    story:
      "Professional services sell trust before they sell hours. Legal & Professional groups premium URLs that signal expertise. Ideal for sponsors in regulated spaces and operators who can package advice, tools, and referrals responsibly.",
    keywords: ["legal", "law", "compliance", "professional", "advisory", "b2b"],
    domains: ["contrib.com", "ipartner.com"],
    image: pexels(5668858, "Professional reviewing documents", "Sora Shimazaki", "@sora-shimazaki"),
    suitedModes: ["sponsor", "operator", "vendor", "builder"],
  },
  {
    slug: "crypto",
    name: "Crypto & Web3",
    blurb: "On-chain brands, wallets, and decentralized product surfaces.",
    story:
      "Crypto natives type category words first. This vertical gathers names adjacent to wallets, protocols, and web3 products — a home for sponsors who understand the culture and builders who ship where ownership is programmable.",
    keywords: ["crypto", "web3", "blockchain", "defi", "tokens", "on-chain"],
    domains: ["agentdao.com", "agentbank.com", "vnoc.com"],
    image: pexels(844124, "Cryptocurrency coins and digital finance", "Worldspectrum", "@worldspectrum"),
    suitedModes: ["sponsor", "builder", "app", "referrer"],
  },
];

export type HomepageVertical = Pick<Vertical, "slug" | "name" | "blurb" | "domains">;

/** Homepage showcase — first five flagship verticals. */
export const HOMEPAGE_VERTICALS: HomepageVertical[] = VERTICALS.slice(0, 5).map((v) => ({
  slug: v.slug,
  name: v.name,
  blurb: v.blurb,
  domains: v.domains,
}));

export function getVertical(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}

export function getAllVerticalSlugs(): string[] {
  return VERTICALS.map((v) => v.slug);
}

export type VerticalSearchHit = Vertical & { score: number };

/** Ranked keyword search across name, blurb, story, keywords, and domains. */
export function searchVerticals(query: string, limit = 12): VerticalSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return VERTICALS.slice(0, limit).map((v) => ({ ...v, score: 0 }));
  }
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = VERTICALS.map((v) => {
    const hay = [v.name, v.blurb, v.story, v.slug, ...v.keywords, ...v.domains]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (v.slug === t || v.name.toLowerCase() === t) score += 12;
      else if (v.name.toLowerCase().includes(t)) score += 8;
      else if (v.keywords.some((k) => k.includes(t) || t.includes(k))) score += 6;
      else if (v.domains.some((d) => d.includes(t))) score += 5;
      else if (hay.includes(t)) score += 2;
    }
    return { ...v, score };
  })
    .filter((v) => v.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export type MatchInterest =
  | "sponsor"
  | "build"
  | "domain"
  | "product"
  | "refer";

export type MatchCommitment = "capital" | "few_hours" | "part_time" | "full_time";

export type MatchResult = {
  mode: "sponsor" | "builder" | "domain_owner" | "vendor" | "referrer" | "operator";
  modeLabel: string;
  summary: string;
  verticals: Vertical[];
  applyHref: string;
};

const MODE_COPY: Record<MatchResult["mode"], { label: string; summary: string }> = {
  sponsor: {
    label: "Sponsor",
    summary: "Put your brand beside category-defining domains — apply to reserve a seat.",
  },
  builder: {
    label: "Builder",
    summary: "Take an equity-style partnership and help build a brand in a vertical you care about.",
  },
  domain_owner: {
    label: "Domain owner",
    summary: "Bring a premium name into the network and partner on how it grows.",
  },
  vendor: {
    label: "Vendor",
    summary: "Offer products or services across domain ventures that need what you sell.",
  },
  referrer: {
    label: "Referrer",
    summary: "Send traffic and introductions — earn when your network converts.",
  },
  operator: {
    label: "Operator",
    summary: "Lead day-to-day execution on a venture and shape how the brand runs.",
  },
};

export function matchPartner(input: {
  interest: MatchInterest;
  verticalSlugs: string[];
  commitment: MatchCommitment;
}): MatchResult {
  let mode: MatchResult["mode"];
  switch (input.interest) {
    case "sponsor":
      mode = "sponsor";
      break;
    case "domain":
      mode = "domain_owner";
      break;
    case "product":
      mode = "vendor";
      break;
    case "refer":
      mode = "referrer";
      break;
    case "build":
    default:
      mode = input.commitment === "full_time" ? "operator" : "builder";
      break;
  }

  const picked = input.verticalSlugs
    .map((s) => getVertical(s))
    .filter((v): v is Vertical => !!v);

  const fallback = VERTICALS.filter((v) =>
    v.suitedModes.includes(mode === "operator" ? "operator" : mode),
  ).slice(0, 3);

  const verticals = (picked.length ? picked : fallback).slice(0, 3);
  const primary = verticals[0];
  const copy = MODE_COPY[mode];

  const params = new URLSearchParams({ mode });
  if (primary) params.set("vertical", primary.slug);

  return {
    mode,
    modeLabel: copy.label,
    summary: copy.summary,
    verticals,
    applyHref: `/apply?${params.toString()}`,
  };
}
