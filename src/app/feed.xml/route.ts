import { NextResponse } from "next/server";
import { getPosts } from "@/data/posts";
import { buildRssItems, serializeRssFeed } from "@/data/rssFeed";
import { getSiteUrl } from "@/data/siteConfig";

/**
 * Static RSS feed route (no request input — `GET /feed.xml`). Wires the pure
 * `rssFeed` builder/serializer to the real `getPosts()` source and the
 * validated `SITE_URL` domain.
 *
 * The only failure expected here is `SITE_URL` misconfiguration, surfaced by
 * `getSiteUrl()` as an `Error` whose message is prefixed `[siteConfig]` (see
 * `resolveSiteUrl` in `src/data/siteConfig.ts`). That specific case is caught
 * and turned into a generic 500 — logged server-side only via
 * `console.error`, never interpolated into the response body, so no stack
 * trace or filesystem path reaches the client. Any other error is a
 * programmer bug or unexpected build-time failure and is re-thrown so it
 * surfaces loudly rather than being masked as a runtime 500.
 */
export const dynamic = "force-static";

function isSiteConfigError(err: unknown): boolean {
  return err instanceof Error && err.message.startsWith("[siteConfig]");
}

export function GET() {
  try {
    const items = buildRssItems(getPosts(), getSiteUrl());
    const xml = serializeRssFeed(items);
    return new NextResponse(xml, {
      status: 200,
      headers: { "content-type": "application/rss+xml; charset=utf-8" },
    });
  } catch (err) {
    if (!isSiteConfigError(err)) {
      throw err;
    }
    console.error("[feed.xml] failed to build RSS feed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
