/**
 * Site-domain config. The absolute-URL base used by server-only build
 * artifacts (currently the RSS feed, `src/app/feed.xml/route.ts`) and by
 * `metadataBase` in the root layout — a single seam for "what domain is this
 * site deployed at."
 *
 * Read from the build-time `SITE_URL` env var. Deliberately NOT
 * `NEXT_PUBLIC_SITE_URL`: nothing that consumes this value ships to the
 * client bundle, so the var stays server-only.
 *
 * Mirrors the fail-fast pattern in `postLoader.ts` (`requireField`/
 * `requireDate`): a missing/empty/malformed value is an authoring/deploy-time
 * configuration bug, surfaced loudly at the point of use rather than absorbed
 * into a silent fallback (e.g. `localhost`) that would ship a wrong domain
 * into a published feed.
 */

/**
 * Pure core: validates an already-read env value. Takes the raw value as a
 * parameter (rather than reading `process.env` itself) so it is unit-testable
 * without env mutation, and normalizes it via `new URL(...)` so a value like
 * `https://ernest.dev` (no trailing slash) round-trips to a consistent base
 * for `new URL(path, siteUrl)` call sites.
 */
export function resolveSiteUrl(rawValue: string | undefined): string {
  const value = rawValue?.trim();
  if (!value) {
    throw new Error(
      '[siteConfig] "SITE_URL" env var is missing or empty. Set it to the site\'s absolute origin, e.g. SITE_URL=https://ernest.dev'
    );
  }
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(
      `[siteConfig] "SITE_URL" env var "${value}" is not a valid absolute URL, e.g. SITE_URL=https://ernest.dev`
    );
  }
}

/**
 * Impure rind: the single call site that reads `process.env.SITE_URL`.
 * Everything else (the feed builder, root layout metadata) calls
 * `getSiteUrl()` rather than touching `process.env` directly.
 *
 * Deliberately lazy (not a module-scope constant): a module-scope
 * `resolveSiteUrl(process.env.SITE_URL)` would throw at *import* time,
 * crashing every test file that transitively imports this module (including
 * ones unrelated to SITE_URL) rather than only the code paths that actually
 * need the domain.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl(process.env.SITE_URL);
}
