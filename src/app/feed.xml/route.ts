import { NextResponse } from "next/server";
import { getPosts } from "@/data/posts";
import { buildRssItems, serializeRssFeed } from "@/data/rssFeed";
import { getSiteUrl } from "@/data/siteConfig";

/**
 * Static RSS feed route (no request input — `GET /feed.xml`). Wires the pure
 * `rssFeed` builder/serializer to the real `getPosts()` source and the
 * validated `SITE_URL` domain.
 *
 * Any internal failure (e.g. a malformed Post that slipped past the loader,
 * or a config error) is caught here and turned into a generic 500 — the
 * caught error is logged server-side only via `console.error`, never
 * interpolated into the response body, so no stack trace or filesystem path
 * reaches the client.
 */
export const dynamic = "force-static";

export function GET() {
  try {
    const items = buildRssItems(getPosts(), getSiteUrl());
    const xml = serializeRssFeed(items);
    return new NextResponse(xml, {
      status: 200,
      headers: { "content-type": "application/rss+xml" },
    });
  } catch (err) {
    console.error("[feed.xml] failed to build RSS feed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
