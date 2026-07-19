/**
 * Footer link data for the site-wide `Footer` organism. Data tier only - no
 * JSX, no colors, no icon components. `FooterIconKey` is resolved to a concrete
 * icon element in the presentation seam (`utils/footerPresentation.tsx`).
 */
export type FooterIconKey = "linkedin" | "email" | "rss";

export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly icon: FooterIconKey;
}

/**
 * The `Footer` hardens external links automatically: any `href` beginning with
 * `http(s)` opens in a new tab with `rel="noopener noreferrer"`. There is no
 * per-link `external` flag to forget - protocol is the single source of truth.
 */
export const defaultFooterLinks: readonly FooterLink[] = [
  {
    label: "LinkedIn",
    // TODO: replace with the real profile URL (stub until confirmed).
    href: "https://www.linkedin.com/in/ernest-bednarczyk",
    icon: "linkedin",
  },
  { label: "Email", href: "mailto:contact@coldtake.dev", icon: "email" },
  { label: "RSS feed", href: "/feed.xml", icon: "rss" },
];
