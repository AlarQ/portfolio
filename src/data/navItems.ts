/**
 * The single source of truth for the main navigation routes. Route + label
 * only — no JSX, color, or icons — so it belongs in `src/data` per the seam
 * pattern (see repo `CLAUDE.md`). Both `DesktopNav` and `MobileNav` consume
 * `navItems` instead of each carrying a parallel hardcoded copy, so adding a
 * route is a one-line edit here that cannot drift between the two layouts.
 *
 * The site is blog-only today: `/` redirects to `/blog` and `/projects` is a
 * 404 (see `next.config.ts`), so the nav exposes a single Blog link.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navItems: readonly NavItem[] = [{ href: "/blog", label: "Blog" }];
