import Link from "next/link";
import type { NavItem } from "@/data/navItems";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { ThemePill } from "./ThemePill";

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
    <header className="bg-background py-header-y text-foreground">
      <div className="mx-auto flex w-full max-w-content items-center justify-between px-6 py-navbar-y">
        <span className="text-xl font-semibold leading-6">{brandLabel}</span>
        <nav aria-label="Primary" className="hidden items-center gap-nav-gap md:flex">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`p-2 text-xl leading-6 text-foreground no-underline ${
                  active ? "border-b border-foreground pb-nav-active font-bold" : "font-normal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemePill />
        </nav>
        <div className="md:hidden">
          <HeaderMobileMenu items={items} activeHref={activeHref} />
        </div>
      </div>
      {title ? (
        // Masthead: `@container` makes the band a container-query context so the
        // headline is sized in `cqi` (band inline-size), not `vw`. Because `cqi`
        // tracks the band's *content* box, it accounts for `px-6` and fills the
        // band at every width (320→1216) without clipping — the fit-to-band fix.
        // The band is `max-w-content` (1216px), so `19cqi` tops out at ~222px on
        // desktop; the `243.8px` clamp arg is therefore an inert safety ceiling
        // that only bites if the band's max width is ever raised. `overflow-hidden`
        // + `whitespace-nowrap` remain the guard that clips a genuinely over-long
        // title (see the `LongTitle` story) instead of breaking page layout.
        <div className="@container mx-auto mt-masthead-top w-full max-w-content overflow-hidden border-y border-border px-6">
          <h1 className="whitespace-nowrap text-[clamp(3rem,19cqi,243.8px)] font-bold leading-none text-foreground">
            {title}
          </h1>
        </div>
      ) : null}
    </header>
  );
}
