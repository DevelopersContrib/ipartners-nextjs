import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
} from "@/lib/help/articles";
import { isHelpAiConfigured } from "@/lib/help/ai";
import HelpSearch from "@/components/portal/HelpSearch";
import HelpAssistant from "@/components/portal/HelpAssistant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Help — iPartner",
  robots: { index: false },
};

export default async function HelpCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePartner("/portal/help");
  const { q } = await searchParams;
  const aiConfigured = isHelpAiConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
          Help center
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Guides &amp; Ask AI
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          Search the partner guide, browse by topic, or ask AI for a quick answer grounded in
          these articles.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <HelpSearch initialQuery={q || ""} />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">Browse by topic</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {HELP_CATEGORIES.map((cat) => {
                const count = HELP_ARTICLES.filter((a) => a.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-900">{cat.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{cat.blurb}</p>
                    <p className="mt-2 text-[11px] text-zinc-400">{count} guides</p>
                    <ul className="mt-3 space-y-1.5">
                      {HELP_ARTICLES.filter((a) => a.category === cat.id).map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={`/portal/help/${a.slug}`}
                            className="text-xs font-medium text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline"
                          >
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="text-xs text-zinc-400">
            Need a human?{" "}
            <a
              href="mailto:hello@ipartner.com"
              className="font-medium text-zinc-600 underline underline-offset-2"
            >
              hello@ipartner.com
            </a>{" "}
            or{" "}
            <Link href="/contact" className="font-medium text-zinc-600 underline underline-offset-2">
              contact form
            </Link>
            .
          </p>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="hidden lg:block">
            <HelpAssistant aiConfigured={aiConfigured} />
          </div>
          <div className="lg:hidden">
            <HelpAssistant aiConfigured={aiConfigured} compact />
          </div>
        </aside>
      </div>
    </div>
  );
}
