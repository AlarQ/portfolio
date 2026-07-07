import type { NavItem } from "@/data/navItems";

/**
 * Design fixture for the Header story/tests. Typed against the real `NavItem`
 * from `src/data/navItems.ts` so a schema change surfaces here as a compile
 * error rather than silently drifting. Uses the four Figma navbar labels; the
 * production nav (Blog-only) is passed at the app route, not from here.
 */
export const sampleNavItems: readonly NavItem[] = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
];
