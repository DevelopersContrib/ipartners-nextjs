"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { HELP_ARTICLES, type HelpArticle } from "@/lib/help/articles";
import { searchHelpArticles } from "@/lib/help/search";

function ArticleRow({ article }: { article: HelpArticle }) {
  return (
    <Link
      href={`/portal/help/${article.slug}`}
      className="block rounded-2xl border border-zinc-200/90 bg-white p-4 transition hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
    >
      <p className="text-sm font-semibold text-zinc-900">{article.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{article.summary}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {article.category.replace("-", " ")}
      </p>
    </Link>
  );
}

export default function HelpSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const deferred = useDeferredValue(q.trim());

  const results = useMemo(() => {
    if (!deferred) return null;
    return searchHelpArticles(deferred, 16);
  }, [deferred]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search help</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guides — apply, deals, PartnerScore…"
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.04]"
          autoComplete="off"
        />
      </label>

      {results ? (
        results.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No guides matched. Try another phrase or ask AI below.
          </p>
        ) : (
          <ul className="space-y-3">
            {results.map((a) => (
              <li key={a.slug}>
                <ArticleRow article={a} />
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="space-y-3">
          {HELP_ARTICLES.slice(0, 6).map((a) => (
            <li key={a.slug}>
              <ArticleRow article={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
