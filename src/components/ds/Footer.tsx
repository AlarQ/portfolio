import { defaultFooterLinks, type FooterLink } from "@/data/footerLinks";
import { footerIcon } from "@/utils/footerPresentation";

/**
 * Bespoke organism for the site-wide footer (Figma 614:668 light / 614:2227
 * dark): a copyright line plus a link menu with icons. Presentational server
 * component; binds solely to semantic Tailwind classes so it inverts light↔dark
 * for free — no raw hex/palette lookups (`no-direct-palette-import`).
 *
 * Responsive via container queries (`@container` + `@md:`), matching Header's
 * masthead approach: stacked-centered when narrow (dark node), a single left
 * row when wide (light node). Copyright is `order-last @md:order-first` so it
 * sits below the menu when stacked and first-in-row when wide.
 *
 * Every target is either an external site, a `mailto:`, or a static feed route —
 * never an in-app page — so the menu renders plain `<a>` elements rather than
 * `next/link` (which would fire useless route prefetches, including 404s against
 * the feed handler). External `http(s)` links are hardened automatically by
 * protocol sniff, so a raw external URL can never slip through unhardened.
 *
 * Prop defaults keep existing bare `<Footer />` call sites (PostLayout, pages/
 * Home, pages/Author) working unchanged.
 */
export interface FooterProps {
  links?: readonly FooterLink[];
  copyrightName?: string;
}

export function Footer({
  links = defaultFooterLinks,
  copyrightName = "Ernest Bednarczyk",
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background py-header-y text-foreground">
      <div className="@container mx-auto w-full max-w-content px-6">
        <div className="flex flex-col items-center gap-header-y text-xl leading-6 @md:flex-row @md:items-start @md:gap-3.5">
          <p className="order-last @md:order-first">
            © {year} {copyrightName}
          </p>
          <nav
            aria-label="Social links"
            className="flex flex-col items-center gap-3.5 @md:flex-row @md:items-start"
          >
            {links.map((link) => {
              const external = link.href.startsWith("http");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 text-foreground no-underline hover:underline"
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {footerIcon(link.icon)}
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
