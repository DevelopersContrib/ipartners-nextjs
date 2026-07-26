import { HELP_ARTICLES, type HelpArticle } from "@/lib/help/articles";

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

/** Ranked full-text search over the help knowledge base. */
export function searchHelpArticles(query: string, limit = 12): HelpArticle[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored = HELP_ARTICLES.map((article) => {
    const hay = [
      article.title,
      article.summary,
      article.tags.join(" "),
      article.category,
      article.body,
    ]
      .join("\n")
      .toLowerCase();

    let score = 0;
    for (const t of tokens) {
      if (article.title.toLowerCase().includes(t)) score += 8;
      if (article.tags.some((tag) => tag.includes(t) || t.includes(tag))) score += 5;
      if (article.summary.toLowerCase().includes(t)) score += 3;
      if (hay.includes(t)) score += 1;
      // Light stemming-ish: plural
      if (t.endsWith("s") && hay.includes(t.slice(0, -1))) score += 1;
    }
    return { article, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title));

  return scored.slice(0, limit).map((x) => x.article);
}

/** Build a compact context block for the AI assistant. */
export function helpContextForQuery(query: string, limit = 5): string {
  const hits = searchHelpArticles(query, limit);
  if (hits.length === 0) {
    return HELP_ARTICLES.slice(0, 4)
      .map(
        (a) =>
          `### ${a.title} (slug: ${a.slug})\n${a.summary}\n${a.body.slice(0, 600)}`,
      )
      .join("\n\n");
  }
  return hits
    .map(
      (a) =>
        `### ${a.title} (slug: ${a.slug})\nCategory: ${a.category}\n${a.body}`,
    )
    .join("\n\n---\n\n");
}

/** Local (no-LLM) answer when OPENAI_API_KEY is missing. */
export function localHelpAnswer(query: string): {
  answer: string;
  articleSlugs: string[];
} {
  const hits = searchHelpArticles(query, 4);
  if (hits.length === 0) {
    return {
      answer:
        "I couldn't find a matching help article. Try searching for Discover, Apply, Deals, PartnerScore, or placements — or email hello@ipartner.com for human support.",
      articleSlugs: [],
    };
  }

  const top = hits[0];
  const extras = hits.slice(1);
  const lines = [
    `Based on our help guides, here's the best match for “${query.trim()}”:`,
    "",
    `**${top.title}**`,
    top.summary,
    "",
    ...top.body.split("\n").slice(0, 14),
  ];
  if (extras.length) {
    lines.push("", "Related guides:");
    for (const a of extras) {
      lines.push(`• ${a.title} (/portal/help/${a.slug})`);
    }
  }
  lines.push(
    "",
    "For account-specific issues, contact hello@ipartner.com.",
  );

  return {
    answer: lines.join("\n"),
    articleSlugs: hits.map((h) => h.slug),
  };
}
