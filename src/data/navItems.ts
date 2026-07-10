/**
 * The single source of truth for the main navigation routes. Route + label
 * only — no JSX, color, or icons — so it belongs in `src/data` per the seam
 * pattern (see repo `CLAUDE.md`). `ds/Header` (desktop nav + mobile drawer)
 * consumes `navItems` instead of hardcoding a copy, so adding a route is a
 * one-line edit here that cannot drift between the two layouts.
 *
 * The site is blog-only today: the Blog index lives at `/` and `/blog`
 * 308-redirects there (ADR-RM-4, `next.config.ts`); `/projects` is a 404. The
 * nav exposes a single Blog link pointed at `/`, the real destination —
 * `Header`'s active-state check is a plain `href === activeHref` equality
 * (`ds/Header.tsx`), so the link target and every caller's `activeHref` must
 * agree on this same value.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navItems: readonly NavItem[] = [{ href: "/", label: "Blog" }];
