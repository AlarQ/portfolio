import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import type { NavItem } from "@/data/navItems";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

/**
 * Bespoke organism for the site-wide header: a navbar (brand + prop-driven
 * nav links + a visual-only theme pill) plus an optional "masthead" title
 * band when `title` is set. Presentational only; binds solely to semantic
 * Tailwind classes so it inverts light↔dark for free — no raw hex/palette
 * lookups (`no-direct-palette-import`).
 *
 * The theme pill is intentionally non-interactive for now (`aria-hidden`);
 * next-themes click wiring is deferred.
 */
export interface HeaderProps {
  items: readonly NavItem[];
  activeHref?: string;
  brandLabel?: string;
  title?: string;
}

export function Header({ items, activeHref, brandLabel = "Your Name", title }: HeaderProps) {
  return (
    <header className="bg-background py-[30px] text-foreground">
      <div className="mx-auto flex w-full max-w-[1216px] items-center justify-between px-6 py-[10px]">
        <span className="text-xl font-semibold leading-6">{brandLabel}</span>
        <nav aria-label="Primary" className="hidden items-center gap-[14px] md:flex">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`p-2 text-xl leading-6 text-foreground no-underline ${
                  active ? "border-b border-foreground pb-[5px] font-bold" : "font-normal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Visual-only theme pill — inverts with theme via semantic tokens. */}
          <span
            aria-hidden
            className="inline-flex items-center gap-4 rounded-[29px] bg-foreground px-4 py-2 text-background"
          >
            <Sun className="size-6" />
            <Moon className="size-6" />
          </span>
        </nav>
        <div className="md:hidden">
          <HeaderMobileMenu items={items} activeHref={activeHref} />
        </div>
      </div>
      {title ? (
        <div className="mx-auto mt-[50px] w-full max-w-[1216px] overflow-hidden border-y border-border px-6">
          <h1 className="whitespace-nowrap text-[clamp(3rem,18vw,243.8px)] font-bold leading-none text-foreground">
            {title}
          </h1>
        </div>
      ) : null}
    </header>
  );
}
