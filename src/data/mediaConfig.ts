/**
 * Media-domain config. The base URL Capability clip/poster/still URLs are
 * assembled under (FR-4) - a single seam for "where do Project media assets
 * live", sibling of `siteConfig.ts`.
 *
 * Read from the build-time `MEDIA_BASE_URL` env var, server-only (baked at
 * SSG, never `NEXT_PUBLIC_*`). Unlike `SITE_URL` this one is NOT fail-fast:
 * an unset value falls back to `"/media"`, the on-site `public/media/`
 * mount, so local dev and a Project with no clips both work with zero
 * config.
 */

/**
 * Pure core: normalizes an already-read env value. Empty/whitespace-only
 * falls back to `"/media"`; a trailing slash is stripped so callers can
 * always join with a single `/` (`${base}/${slug}/${filename}`).
 */
export function resolveMediaBaseUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "/media";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/** Impure rind: the single call site that reads `process.env.MEDIA_BASE_URL`. */
export function getMediaBaseUrl(): string {
  return resolveMediaBaseUrl(process.env.MEDIA_BASE_URL);
}
