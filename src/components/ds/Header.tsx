import Image from "next/image";
import Link from "next/link";
import type { NavItem } from "@/data/navItems";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { ThemePill } from "./ThemePill";

/**
 * Bespoke organism for the site-wide header: a navbar (brand + prop-driven
 * nav links + a visual-only theme pill) plus an optional "masthead" title
 * band when `title` is set. Presentational only; binds solely to semantic
 * Tailwind classes so it inverts light↔dark for free - no raw hex/palette
 * lookups (`no-direct-palette-import`).
 *
 * The theme pill is intentionally non-interactive for now (`aria-hidden`);
 * next-themes click wiring is deferred.
 */
export interface HeaderProps {
  items: readonly NavItem[];
  activeHref?: string;
  /** Accessible label for the brand mark (rendered as `alt` text, not visible copy). */
  brandLabel?: string;
  title?: string;
  /** Optional tagline rendered beneath the masthead `title` (no-op without `title`). */
  subtitle?: string;
}

export function Header({
  items,
  activeHref,
  brandLabel = "Cold Take",
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header className="bg-background py-3 text-foreground md:py-header-y">
      <div className="mx-auto flex w-full max-w-content items-center justify-between px-6 py-navbar-y">
        <Link href="/" className="flex items-center">
          <Image src="/images/brand-mark.png" alt={brandLabel} width={36} height={36} priority />
        </Link>
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
        // Masthead: compact one-liner - title + tagline share one baseline row
        // separated by a slash, under a single bottom rule. `@container` keeps
        // the headline/tagline sized in `cqi` (band inline-size) so they scale
        // with the band rather than the viewport. Dense on purpose: the post
        // grid should lead, not a band-filling headline. Wraps via `flex-wrap`
        // for long titles instead of clipping (see the `LongTitle` story).
        <div className="@container mx-auto mt-6 w-full max-w-content border-b border-border px-6 pb-3 md:mt-masthead-top md:pb-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1
              className="text-[clamp(2.25rem,6.5cqi,4rem)] font-bold leading-none text-foreground lowercase"
              aria-describedby={subtitle ? "masthead-tagline" : undefined}
            >
              {title}
            </h1>
            {subtitle ? (
              <>
                <span className="text-3xl font-light leading-none text-border" aria-hidden>
                  /
                </span>
                <p
                  id="masthead-tagline"
                  className="text-[clamp(1.15rem,2.8cqi,1.625rem)] font-normal leading-none text-muted-foreground"
                >
                  {subtitle}
                </p>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
