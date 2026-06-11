/**
 * The single source of truth for the main navigation routes. Route + label
 * only — no JSX, color, or icons — so it belongs in `src/data` per the seam
 * pattern (see repo `CLAUDE.md`). Both `DesktopNav` and `MobileNav` consume
 * this one array instead of each carrying a parallel hardcoded copy, so adding
 * a route is a one-line edit here that cannot drift between the two layouts.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navItems: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];
