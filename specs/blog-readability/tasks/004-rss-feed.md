---
id: "004"
name: RSS feed and site-domain config
status: in-progress
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
- Add `src/data/siteConfig.ts`: read the **build-time `SITE_URL` env** (decision, grilling 2026-07-02 — **not** `NEXT_PUBLIC_`; the feed is built server-side and the domain never needs to reach the client bundle), validate once with `new URL(...)`, fail fast on missing/empty/malformed — the single home of the absolute-URL base (mirrors the fail-fast pattern in `postLoader`). Wire `metadataBase` in root metadata from the same value so the domain has one seam.
- Add `src/data/rssFeed.ts`: a pure builder mapping `getPosts()` → RSS items, XML-escaping every interpolated field; unit-tested with injected config and Post fixtures.
- Add `src/app/feed.xml/route.ts`: a static route handler (no request input) that serializes the builder output with the correct content-type.

## Implementation Log
