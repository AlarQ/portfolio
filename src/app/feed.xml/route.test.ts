import { afterEach, describe, expect, it, vi } from "vitest";

const SECRET_DETAIL = "SECRET_INTERNAL_DETAIL_xyz";

vi.mock("@/data/posts", () => ({
  getPosts: vi.fn(),
}));
vi.mock("@/data/rssFeed", () => ({
  buildRssItems: vi.fn(),
  serializeRssFeed: vi.fn(),
}));
vi.mock("@/data/siteConfig", () => ({
  getSiteUrl: vi.fn(),
}));

describe("GET /feed.xml — failure path never leaks internals", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("responds 500 with a generic message when SITE_URL is misconfigured", async () => {
    // Given a SITE_URL config failure that throws with a distinctive,
    // sensitive-looking message (the only failure GET() is expected to catch)
    const { getPosts } = await import("@/data/posts");
    const { getSiteUrl } = await import("@/data/siteConfig");
    vi.mocked(getPosts).mockReturnValue([]);
    vi.mocked(getSiteUrl).mockImplementation(() => {
      throw new Error(`[siteConfig] ${SECRET_DETAIL} at /Users/ernest/secret/path/rssFeed.ts:42`);
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    // When GET /feed.xml is invoked
    const { GET } = await import("./route");
    const response = GET();
    const text = await response.text();

    // Then the response is a generic 500 with no trace of the thrown error
    expect(response.status).toBe(500);
    expect(text).not.toContain(SECRET_DETAIL);
    expect(text).not.toContain("/Users/ernest/secret/path");
    expect(text).not.toContain(".ts:42");
    expect(text).not.toMatch(/at .*:\d+:\d+/);
  });
});
