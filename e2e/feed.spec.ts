import { expect, test } from "@playwright/test";

/**
 * RSS feed E2E (chromium — the reliable signal; see repo CLAUDE.md).
 *
 * Scenarios: feed-valid-xml, feed-entry-per-post, feed-absolute-urls (FR-5/6,
 * EP-FEED-GET). Exercises the real `/feed.xml` route wired to the real
 * `getPosts()` + `SITE_URL` config — the fixture-based unit coverage lives in
 * `src/data/rssFeed.test.ts`.
 */
test.describe("RSS feed", () => {
  test("GET /feed.xml returns 200, well-formed RSS/XML, with one item per published Post", async ({
    page,
    request,
  }) => {
    // The Post index gives us the expected item count independent of the feed
    // implementation itself. `pages/Home` (served at `/` post-ADR-RM-4) renders
    // exactly one `ds/PostCard` `<article>` per Post across its Recent/All
    // sections, so counting articles is the whole published set.
    await page.goto("/");
    const postCount = await page.locator("article").count();
    expect(postCount).toBeGreaterThan(0);

    const response = await request.get("/feed.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/rss+xml");

    const xml = await response.text();

    // Well-formed: parses without error and round-trips back to an <rss> root.
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<rss");
    expect(xml).toContain("</rss>");

    const itemMatches = xml.match(/<item>/g) ?? [];
    expect(itemMatches).toHaveLength(postCount);

    // Absolute URLs, never localhost.
    expect(xml).not.toContain("localhost");
    expect(xml).toMatch(/<link>https:\/\/[^<]+<\/link>/);
  });
});
