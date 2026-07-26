import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartner } from "@/lib/auth";
import {
  getHelpArticle,
  HELP_CATEGORIES,
  HELP_ARTICLES,
} from "@/lib/help/articles";
import { isHelpAiConfigured } from "@/lib/help/ai";
import HelpAssistant from "@/components/portal/HelpAssistant";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  return {
    title: article ? `${article.title} — Help` : "Help",
    robots: { index: false },
  };
}

function Body({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every(
          (l) => l.trim().startsWith("•") || l.trim() === "" || /^\d+\./.test(l.trim()),
        );
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {lines
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l, j) => (
                  <li key={j}>{l.replace(/^[•\d]+\.?\s*/, "")}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requirePartner();
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) notFound();

  const category = HELP_CATEGORIES.find((c) => c.id === article.category);
  const related = (article.related || [])
    .map((s) => getHelpArticle(s))
    .filter((a): a is NonNullable<typeof a> => !!a);
  const aiConfigured = isHelpAiConfigured();

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="min-w-0 space-y-6">
        <Link
          href="/portal/help"
          className="inline-flex min-h-10 items-center text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          ← Help center
        </Link>

        <header className="space-y-2">
          {category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {category.label}
            </p>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-zinc-500 sm:text-base">{article.summary}</p>
        </header>

        <Body text={article.body} />

        {related.length > 0 && (
          <section className="space-y-2 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold text-zinc-900">Related</h2>
            <ul className="space-y-1.5">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/portal/help/${a.slug}`}
                    className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-zinc-400">
          Still stuck?{" "}
          <a href="mailto:hello@ipartner.com" className="underline underline-offset-2">
            Email support
          </a>{" "}
          or browse{" "}
          <Link href="/portal/help" className="underline underline-offset-2">
            all {HELP_ARTICLES.length} guides
          </Link>
          .
        </p>
      </article>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="hidden lg:block">
          <HelpAssistant aiConfigured={aiConfigured} />
        </div>
        <div className="lg:hidden">
          <HelpAssistant aiConfigured={aiConfigured} compact />
        </div>
      </aside>
    </div>
  );
}
