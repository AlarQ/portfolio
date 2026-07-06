/**
 * Bespoke organism for the site-wide footer. Presentational only; composed
 * into `PostLayout`. Binds only to semantic Tailwind classes — no raw
 * hex/palette lookups (`no-direct-palette-import`).
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-8 text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} — built with the design system.</p>
    </footer>
  );
}
