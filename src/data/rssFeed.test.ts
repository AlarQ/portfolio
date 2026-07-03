import { describe, expect, it } from "vitest";
import type { Post } from "./posts";
import { buildRssItems, serializeRssFeed } from "./rssFeed";

function post(overrides: Partial<Post> = {}): Post {
  return {
    slug: "sample-post",
    title: "Sample Post",
    dek: "A sample dek.",
    date: "2026-06-09",
    readingTimeMinutes: 3,
    formattedDate: "9 June 2026",
    published: true,
    ...overrides,
  };
}

describe("buildRssItems — absolute URLs from injected domain", () => {
  it("roots link and guid at the injected site domain, never relative or localhost", () => {
    // Given a configured site domain and a Post
    const posts = [post({ slug: "my-post" })];

    // When RSS items are built against that domain
    const [item] = buildRssItems(posts, "https://ernest.dev");

    // Then link and guid are absolute URLs rooted at that domain
    expect(item.link).toBe("https://ernest.dev/blog/my-post");
    expect(item.guid).toBe("https://ernest.dev/blog/my-post");
    expect(item.link).not.toContain("localhost");
  });
});

describe("buildRssItems — excludes unpublished Posts", () => {
  it("filters out posts with published: false while keeping published: true posts", () => {
    // Given one published and one unpublished Post
    const posts = [
      post({ slug: "published-post", title: "Published", published: true }),
      post({ slug: "draft-post", title: "Draft", published: false }),
    ];

    // When the RSS items are built
    const items = buildRssItems(posts, "https://example.com");

    // Then only the published Post is present
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Published");
    expect(items.some((item) => item.title === "Draft")).toBe(false);
  });
});

describe("serializeRssFeed — XML-escapes special characters", () => {
  it("escapes &, <, >, and quotes in title and description so the document stays well-formed", () => {
    // Given a Post whose title/dek contain XML-special characters
    const posts = [
      post({
        title: 'Ampersands & <Tags> "quotes"',
        dek: "A dek with 'apostrophes' & <brackets>",
      }),
    ];
    const items = buildRssItems(posts, "https://example.com");

    // When the feed is serialized
    const xml = serializeRssFeed(items);

    // Then the raw special characters are escaped, not present verbatim
    expect(xml).not.toContain("Ampersands & <Tags>");
    expect(xml).toContain("Ampersands &amp; &lt;Tags&gt; &quot;quotes&quot;");
    expect(xml).toContain("&apos;apostrophes&apos; &amp; &lt;brackets&gt;");
  });
});

describe("buildRssItems — one item per published Post", () => {
  it("emits exactly one item per Post, carrying title, description, link, pubDate, guid", () => {
    // Given two published Posts
    const posts = [
      post({ slug: "first-post", title: "First" }),
      post({ slug: "second-post", title: "Second" }),
    ];

    // When the RSS items are built
    const items = buildRssItems(posts, "https://example.com");

    // Then there is exactly one item per Post, each carrying all five fields
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.link).toBeTruthy();
      expect(item.pubDate).toBeTruthy();
      expect(item.guid).toBeTruthy();
    }
  });
});
