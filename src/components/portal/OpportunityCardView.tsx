import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { domainPageHref } from "@/lib/vertical-brands";
import {
  formatDomainDisplay,
  formatBrandStat,
  formatBrandValue,
  type OpportunityCard,
} from "@/lib/portal-opportunities";

export default function OpportunityCardView({
  opportunity: o,
  mode,
}: {
  opportunity: OpportunityCard;
  mode?: string;
}) {
  const applyHref = `/apply?domain=${encodeURIComponent(o.domainName)}${
    mode ? `&mode=${mode}` : ""
  }`;

  return (
    <article className="group flex h-full flex-col gap-3.5 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="flex items-start gap-3">
        <BrandLogo domain={o.domainName} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-900 sm:text-[15px]">
            {formatDomainDisplay(o.domainName)}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{o.verticalName}</p>
          {o.categoryName && (
            <p className="mt-0.5 truncate text-[11px] text-zinc-400">{o.categoryName}</p>
          )}
        </div>
        {o.partnerScore > 0 && (
          <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-zinc-700">
            {o.partnerScore}
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
        Open partnership on this brand — scored for traffic, network demand, and asset value.
      </p>

      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-zinc-400">
        {o.value > 0 && <span>{formatBrandValue(o.value)}</span>}
        {o.uniqueVisitors30d > 0 && (
          <span>{formatBrandStat(o.uniqueVisitors30d)} UV / 30d</span>
        )}
        {o.partners > 0 && <span>{o.partners} partners</span>}
      </div>

      <div className="flex flex-wrap gap-2 pt-0.5">
        <Link
          href={domainPageHref(o.domainName)}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 sm:flex-none"
        >
          View
        </Link>
        <Link
          href={applyHref}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:flex-none"
        >
          Apply
        </Link>
      </div>
    </article>
  );
}
