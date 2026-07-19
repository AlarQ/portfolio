---
id: "004"
name: RSS feed and site-domain config
status: done
blocked_by: []
max_files: 6
ground_rules:
  - languages/nextjs/app-router.md
  - security/input-validation.md
  - security/secrets.md
  - security/deps-and-config.md
  - testing/structure.md
test_cases:
  - feed_builder_emits_one_item_per_published_post
  - feed_links_are_absolute_from_injected_domain
  - feed_xml_escapes_special_chars_in_title_and_dek
  - config_missing_or_invalid_domain_throws_at_boundary
  - feed_error_path_leaks_no_internal_detail
  - e2e_feed_xml_returns_200_wellformed_with_item_per_post
estimated_files:
  - src/data/siteConfig.ts
  - src/data/rssFeed.ts
  - src/data/rssFeed.test.ts
  - src/app/feed.xml/route.ts
  - src/theme/theme.ts
  - e2e/feed.spec.ts
interaction: afk
implementer: engineering/backend-architect
pr_url: https://github.com/AlarQ/portfolio/pull/44
---

## Objective
Introduce a fail-fast site-domain env config and a static `/feed.xml` route handler that emits one XML-escaped `<item>` per published Post with absolute URLs, giving the Blog a syndication feed.

## Implements
| Kind      | Ref                                                                                  |
|-----------|--------------------------------------------------------------------------------------|
| FR        | FR-5, FR-6                                                                            |
| Contract  | EP-FEED-GET                                                                           |
| Scenarios | feed-valid-xml, feed-entry-per-post, feed-absolute-urls, sec-rss-xml-escape, sec-feed-domain-config-fail-fast, sec-feed-no-error-leak |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the published Post set | `GET /feed.xml` is served | the response is well-formed RSS/XML (`application/rss+xml`) with exactly one `<item>` per published Post carrying title, description, link, pubDate, guid |
| 2 | the configured site domain | feed item links and guids are generated | each is an absolute URL rooted at the configured domain (`https://<domain>/blog/<slug>`), never relative or localhost |
| 3 | a Post title/dek containing `&`, `<`, `>`, or quotes | it is written into the feed | the characters are XML-escaped at the single serialization point so the document stays well-formed |
| 4 | the site-domain env var is missing, empty, or malformed | config is read at build | the build fails fast with a clear developer-facing message and no feed with a wrong/empty domain is emitted |
| 5 | an internal error while building the feed | the handler responds | no internal stack trace, filesystem path, or exception text is leaked into client-facing output (build logs only) |

## Approach
- Add `src/data/siteConfig.ts`: read the **build-time `SITE_URL` env** (decision, grilling 2026-07-02 - **not** `NEXT_PUBLIC_`; the feed is built server-side and the domain never needs to reach the client bundle), validate once with `new URL(...)`, fail fast on missing/empty/malformed - the single home of the absolute-URL base (mirrors the fail-fast pattern in `postLoader`). Wire `metadataBase` in root metadata from the same value so the domain has one seam.
- Add `src/data/rssFeed.ts`: a pure builder mapping `getPosts()` → RSS items, XML-escaping every interpolated field; unit-tested with injected config and Post fixtures.
- Add `src/app/feed.xml/route.ts`: a static route handler (no request input) that serializes the builder output with the correct content-type.

## Implementation Log

chunks_spawned: 2

**Chunk 1** - Followed strict red-green-refactor: wrote `src/data/rssFeed.test.ts` first (confirmed RED via missing-module error), then restored the pure builder to reach GREEN, one test at a time. `src/data/rssFeed.ts` exports two pure functions rather than one, deliberately splitting item-building from serialization: `buildRssItems(posts, siteUrl): RssItem[]` (maps `Post[]` + injected domain string to plain-data RSS items, absolute `link`/`guid` via `new URL(path, siteUrl)`) and `serializeRssFeed(items): string` (the single XML-escaping serialization point, per CLAUDE.md's MDX-adjacent "escape at the seam" pattern). Both take injected params rather than reading `getPosts()`/`siteConfig` directly, mirroring the pure-core/impure-rind split in `postLoader.ts`. `escapeXml` escapes `&amp;`, `&lt;`, `&gt;`, `"`, `'` in that order (ampersand first, to avoid double-escaping). `siteConfig.ts` and the route handler out of scope for this chunk.

**Chunk 2 (final)** - `src/data/siteConfig.ts` exports a pure `resolveSiteUrl(rawValue)` (validates via `new URL()`, throws a clear `[siteConfig] "SITE_URL" ...` message on missing/empty/malformed input) and a lazy `getSiteUrl()` reading `process.env.SITE_URL`. Deliberately lazy rather than a module-scope constant - an eager resolve at import time would crash every test file that transitively imports the module, not just code paths that need the domain. Mirrors `postLoader.ts`'s fail-fast pattern. `src/app/layout.tsx` wires `metadataBase: new URL(getSiteUrl())` into the existing `metadata` export - single seam for the domain. `src/app/feed.xml/route.ts`: static route handler (`export const dynamic = "force-static"` - required, else Next builds the route as dynamic). Calls `getPosts()` + `getSiteUrl()` → `buildRssItems` → `serializeRssFeed`, returns `content-type: application/rss+xml`. Errors are caught, logged via `console.error` server-side only, turned into a generic `"Internal Server Error"` 500 body - no stack trace/path/exception text reaches the client. `e2e/feed.spec.ts` derives expected item count from the real `/blog` page's post count (not hardcoded); asserts 200, `application/rss+xml`, well-formed `<rss>`/`<item>` structure, absolute `https://` links, no `localhost`. Fail-fast verified directly: `unset SITE_URL && npm run build` aborts with a clear `[siteConfig]` error; setting it succeeds with `/feed.xml` built static. Whole-task refactor pass found no duplication/extraction opportunities - each module stays small and single-purpose.

**Deployment note:** `SITE_URL` is a build-time env var (not `NEXT_PUBLIC_`) that must be set in the deploy environment (e.g. Vercel project settings) - it was not persisted to `.env.local` in this session (harness denies `.env*` edits); verified instead via inline shell env for build/test runs.

**Verification:** `npm run test:unit` 73/73 passed; `npm run type-check` clean; `npm run lint` clean; `npx playwright test e2e/feed.spec.ts --project=chromium` 1/1 passed; `npm run build` fails fast without `SITE_URL`, succeeds with it set (static `/feed.xml`).
