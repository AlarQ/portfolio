import type { Post } from "./posts";

/**
 * One RSS `<item>`'s fields, pre-escaping. Kept as plain data so the builder
 * stays a pure function testable without any XML/string concerns.
 */
export interface RssItem {
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly pubDate: string;
  readonly guid: string;
}

/**
 * Pure builder: published Posts + a site domain -> RSS items with absolute
 * URLs. Takes `posts` and `siteUrl` as parameters (rather than reading
 * `getPosts()`/`siteConfig` itself) so it is unit-testable with fixtures,
 * mirroring the pure-core/impure-rind split in `postLoader.ts`.
 */
export function buildRssItems(posts: readonly Post[], siteUrl: string): RssItem[] {
  return posts.map((post) => {
    const link = new URL(`/blog/${post.slug}`, siteUrl).toString();
    return {
      title: post.title,
      description: post.dek,
      link,
      pubDate: new Date(`${post.date}T00:00:00Z`).toUTCString(),
      guid: link,
    };
  });
}

/**
 * Serializes RSS items to an RSS 2.0 XML document. This is the SINGLE
 * serialization point where interpolated fields are XML-escaped, so no
 * Post-authored text (title/dek) can break the document's well-formedness.
 */
export function serializeRssFeed(items: readonly RssItem[]): string {
  const itemsXml = items
    .map(
      (item) => `  <item>
    <title>${escapeXml(item.title)}</title>
    <description>${escapeXml(item.description)}</description>
    <link>${escapeXml(item.link)}</link>
    <pubDate>${escapeXml(item.pubDate)}</pubDate>
    <guid>${escapeXml(item.guid)}</guid>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
${itemsXml}
</channel>
</rss>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
