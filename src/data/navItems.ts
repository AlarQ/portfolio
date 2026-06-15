/**
 * The single source of truth for the main navigation routes. Route + label
 * only — no JSX, color, or icons — so it belongs in `src/data` per the seam
 * pattern (see repo `CLAUDE.md`). Both `DesktopNav` and `MobileNav` consume
 * `visibleNavItems` instead of each carrying a parallel hardcoded copy, so
 * adding a route is a one-line edit here that cannot drift between the two
 * layouts.
 *
 * `navItems` is the full source of truth; `visibleNavItems` is the
 * env-filtered render list. Routes flagged `devOnly` (e.g. pages not yet ready
 * for public visitors) are dropped outside development — Next.js inlines
 * `process.env.NODE_ENV` at build time, so the filter is static per build with
 * no SSR/CSR mismatch.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly devOnly?: boolean;
}

export const navItems: readonly NavItem[] = [
  { href: "/", label: "Home", devOnly: true },
  { href: "/projects", label: "Projects", devOnly: true },
  { href: "/blog", label: "Blog" },
];

const isDev = process.env.NODE_ENV === "development";

export const visibleNavItems: readonly NavItem[] = navItems.filter(
  (item) => isDev || !item.devOnly
);
