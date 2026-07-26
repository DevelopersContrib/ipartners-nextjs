import Link from "next/link";

/** Horizontally scrollable chip row — works on mobile without wrapping chaos. */
export default function FilterChips({
  items,
}: {
  items: { href: string; label: string; active: boolean; strong?: boolean }[];
}) {
  return (
    <div className="-mx-3 overflow-x-auto overscroll-x-contain px-3 sm:mx-0 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2 sm:flex-wrap sm:w-auto">
        {items.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-xs font-medium transition whitespace-nowrap ${
              item.active
                ? item.strong !== false
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200/90 text-zinc-900"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
