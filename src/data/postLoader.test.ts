import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPostSet, getAdjacentPosts, type RawPostFile, selectVisiblePosts } from "./postLoader";
import type { Post } from "./posts";

/**
 * Unit tests for the pure core `buildPostSet(rawFiles): Post[]`.
 *
 * These feed RAW-FILE FIXTURES (filename + raw file content) to the pure core
 * - no filesystem - and assert the WHOLE returned Post set in one place:
 * frontmatter parsing, derivations (slug, reading time, formatted date,
 * published), newest-first ordering, and slug-gate exclusions.
 */

function rawFile(filename: string, frontmatter: Record<string, string>, body: string): RawPostFile {
  const fm = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return { filename, content: `---\n${fm}\n---\n\n${body}\n` };
}

describe("buildPostSet - frontmatter parsing", () => {
  it("returns Posts whose authored fields equal the frontmatter values", () => {
    // Given a raw MDX file carrying { title, dek, date } frontmatter
    const files: RawPostFile[] = [
      rawFile(
        "sample-post.mdx",
        {
          title: "Sample Post",
          dek: "A fixture post for the loader test.",
          date: "2026-06-09",
        },
        "A short body of prose."
      ),
    ];

    // When the pure core runs
    const posts = buildPostSet(files);

    // Then the authored fields equal the frontmatter, carrying no JSX/color/icons
    expect(posts).toHaveLength(1);
    const [post] = posts;
    expect(post.title).toBe("Sample Post");
    expect(post.dek).toBe("A fixture post for the loader test.");
    expect(post.date).toBe("2026-06-09");
    expect(post.slug).toBe("sample-post");
  });
});

describe("buildPostSet - reading time derivation", () => {
  it("derives readingTimeMinutes = ceil(wordCount / 200) from the body", () => {
    // Given a body of a known word count (250 words) at a 200 wpm rate
    const body = Array.from({ length: 250 }, () => "word").join(" ");
    const files: RawPostFile[] = [
      rawFile("counted.mdx", { title: "Counted", dek: "d", date: "2026-01-01" }, body),
    ];

    // When the pure core computes reading time
    const [post] = buildPostSet(files);

    // Then it is the word count divided by the rate, rounded up (ceil(250/200) = 2)
    expect(post.readingTimeMinutes).toBe(2);
  });
});

describe("buildPostSet - ordering", () => {
  it("returns the set descending by date, with ties broken by slug ascending", () => {
    // Given files with differing dates and a same-date tie (zebra/alpha)
    const files: RawPostFile[] = [
      rawFile("older.mdx", { title: "Older", dek: "d", date: "2026-01-10" }, "b"),
      rawFile("zebra.mdx", { title: "Zebra", dek: "d", date: "2026-03-02" }, "b"),
      rawFile("alpha.mdx", { title: "Alpha", dek: "d", date: "2026-03-02" }, "b"),
    ];

    // When the pure core orders them
    const posts = buildPostSet(files);

    // Then newest date first; same-date ties ordered by slug ascending; deterministic
    expect(posts.map((p) => p.slug)).toEqual(["alpha", "zebra", "older"]);
  });
});

describe("buildPostSet - draft flag", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks a Post published when no draft key is present", () => {
    // Given a slug-valid file with no `draft` frontmatter
    const files: RawPostFile[] = [
      rawFile("present.mdx", { title: "Present", dek: "d", date: "2026-02-02" }, "b"),
    ];

    // When the pure core builds the set
    const posts = buildPostSet(files);

    // Then published is true (absent draft means published)
    expect(posts).toHaveLength(1);
    expect(posts[0].published).toBe(true);
  });

  it("marks a Post unpublished when draft: true", () => {
    // Given a slug-valid file flagged draft: true (YAML boolean under JSON_SCHEMA)
    const files: RawPostFile[] = [
      rawFile("wip.mdx", { title: "WIP", dek: "d", date: "2026-02-02", draft: "true" }, "b"),
    ];

    // When the pure core builds the set
    const posts = buildPostSet(files);

    // Then the draft is not published
    expect(posts).toHaveLength(1);
    expect(posts[0].published).toBe(false);
  });

  it("marks a Post published when draft: false", () => {
    // Given an explicit draft: false
    const files: RawPostFile[] = [
      rawFile("done.mdx", { title: "Done", dek: "d", date: "2026-02-02", draft: "false" }, "b"),
    ];

    // When the pure core builds the set
    const posts = buildPostSet(files);

    // Then published is true
    expect(posts).toHaveLength(1);
    expect(posts[0].published).toBe(true);
  });

  it("warns and treats a non-boolean draft as not-a-draft, still publishing", () => {
    // Given a non-boolean draft value (a string "yes")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile("odd.mdx", { title: "Odd", dek: "d", date: "2026-02-02", draft: "yes" }, "b"),
    ];

    // When the pure core builds the set
    const posts = buildPostSet(files);

    // Then a warning names the file and the Post still publishes
    expect(posts).toHaveLength(1);
    expect(posts[0].published).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("odd.mdx"))).toBe(true);
  });
});

describe("selectVisiblePosts", () => {
  it("drops unpublished Posts and keeps published when includeDrafts is false", () => {
    // Given a mix of published and unpublished Posts
    const posts: Post[] = [
      { ...fixturePost("live"), published: true },
      { ...fixturePost("draft"), published: false },
    ];

    // When drafts are excluded (production)
    const visible = selectVisiblePosts(posts, false);

    // Then only the published Post survives
    expect(visible.map((p) => p.slug)).toEqual(["live"]);
  });

  it("passes every Post through unchanged, order preserved, when includeDrafts is true", () => {
    // Given a mix of published and unpublished Posts
    const posts: Post[] = [
      { ...fixturePost("live"), published: true },
      { ...fixturePost("draft"), published: false },
    ];

    // When drafts are included (dev)
    const visible = selectVisiblePosts(posts, true);

    // Then all Posts pass through in order
    expect(visible.map((p) => p.slug)).toEqual(["live", "draft"]);
  });
});

describe("buildPostSet - slug gate", () => {
  it("excludes files whose slug fails ^[a-z0-9-]+$, keeping only slug-valid Posts", () => {
    // Given a mix of slug-valid and slug-invalid files (uppercase, traversal, spaces)
    const files: RawPostFile[] = [
      rawFile("valid-slug.mdx", { title: "Valid", dek: "d", date: "2026-01-01" }, "b"),
      rawFile("Has_Uppercase.mdx", { title: "Upper", dek: "d", date: "2026-01-02" }, "b"),
      rawFile("../escape.mdx", { title: "Escape", dek: "d", date: "2026-01-03" }, "b"),
      rawFile("has spaces.mdx", { title: "Spaces", dek: "d", date: "2026-01-04" }, "b"),
    ];

    // When the single slug gate runs
    const posts = buildPostSet(files);

    // Then only the slug-valid file survives - invalid slugs are unrepresentable
    expect(posts.map((p) => p.slug)).toEqual(["valid-slug"]);
  });
});

describe("buildPostSet - slug-pattern rejection (sec)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips a slug failing ^[a-z0-9-]+$ with a warning, never reaching the Post set", () => {
    // Given a file whose derived slug violates the pattern (uppercase + underscore)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile("Bad_Slug.mdx", { title: "Bad", dek: "d", date: "2026-01-01" }, "b"),
    ];

    // When the single slug gate runs
    const posts = buildPostSet(files);

    // Then the file is absent from the set and a build warning was emitted
    expect(posts).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Bad_Slug.mdx");
  });
});

describe("generateStaticParams - allowlist-only (maps loader output verbatim)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns one { slug } param per loader Post, in loader order", async () => {
    // Given a known loader Post set
    const loaderSet = [{ slug: "alpha" }, { slug: "beta" }, { slug: "gamma" }] as ReadonlyArray<{
      slug: string;
    }>;
    vi.doMock("./posts", () => ({ getPosts: () => loaderSet }));

    const { generateStaticParams } = await import("../app/blog/[slug]/page");
    const params = generateStaticParams();

    // Then params are exactly the loader's slugs mapped to { slug }, one-to-one, same order
    expect(params).toEqual(loaderSet.map((p) => ({ slug: p.slug })));
  });
});

describe("buildPostSet - traversal rejection (sec)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a traversal-shaped filename at the gate, never admitting it to the Post set", () => {
    // Given a traversal-shaped candidate alongside a legitimate Post
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile("../etc/passwd.mdx", { title: "Pwn", dek: "d", date: "2026-01-01" }, "b"),
      rawFile("safe-post.mdx", { title: "Safe", dek: "d", date: "2026-01-02" }, "b"),
    ];

    // When the single slug-validation gate runs
    const posts = buildPostSet(files);

    // Then only the safe Post survives; the traversal slug is unrepresentable past the seam
    expect(posts.map((p) => p.slug)).toEqual(["safe-post"]);
  });
});

describe("buildPostSet - fail fast on malformed frontmatter (authoring bugs)", () => {
  it("throws when a slug-valid Post has an empty/missing title", () => {
    // Given a slug-valid file whose title is empty (a frontmatter typo)
    const files: RawPostFile[] = [
      {
        filename: "no-title.mdx",
        content: "---\ntitle: \ndek: d\ndate: 2026-01-01\n---\n\nbody\n",
      },
    ];

    // When the pure core builds the set, the authoring bug fails the build loudly
    expect(() => buildPostSet(files)).toThrow(/no-title\.mdx/);
  });

  it("throws when a slug-valid Post has a non-ISO date", () => {
    // Given a slug-valid file whose date is not YYYY-MM-DD
    const files: RawPostFile[] = [
      rawFile("bad-date.mdx", { title: "T", dek: "d", date: "June 9th" }, "body"),
    ];

    // When the pure core builds the set, the unparseable date fails the build
    expect(() => buildPostSet(files)).toThrow(/bad-date\.mdx/);
  });

  it("throws on an impossible calendar date that JS would silently roll over", () => {
    // Given a shape-valid but impossible date (Feb 30 - JS rolls it to March 2)
    const files: RawPostFile[] = [
      rawFile("rollover.mdx", { title: "T", dek: "d", date: "2026-02-30" }, "body"),
    ];

    // When the pure core builds the set, the rollover is rejected, not absorbed
    expect(() => buildPostSet(files)).toThrow(/rollover\.mdx/);
  });

  it("keeps an unquoted YAML date as a literal ISO string (no Date auto-cast)", () => {
    // Given an unquoted YAML date - the default YAML schema would cast it to a
    // JS Date (and roll impossible days over); the loader's JSON-schema engine
    // keeps it a string so requireDate stays authoritative
    const files: RawPostFile[] = [
      {
        filename: "unquoted-date.mdx",
        content: "---\ntitle: T\ndek: d\ndate: 2026-06-09\n---\n\nbody\n",
      },
    ];

    // When the pure core derives the date
    const [post] = buildPostSet(files);

    // Then it is the exact ISO string, formatted from that same value
    expect(post.date).toBe("2026-06-09");
    expect(post.formattedDate).toBe("9 June 2026");
  });

  it("parses a quoted frontmatter value to its unquoted string (gray-matter YAML)", () => {
    // Given a title wrapped in double quotes (valid YAML the hand-rolled regex mangled)
    const files: RawPostFile[] = [
      {
        filename: "quoted.mdx",
        content: '---\ntitle: "Hello: World"\ndek: d\ndate: 2026-01-01\n---\n\nbody\n',
      },
    ];

    // When the pure core parses frontmatter via gray-matter
    const [post] = buildPostSet(files);

    // Then the colon-bearing quoted value survives intact, unquoted
    expect(post.title).toBe("Hello: World");
  });
});

function fixturePost(slug: string): Post {
  return {
    slug,
    title: slug,
    dek: "d",
    date: "2026-01-01",
    readingTimeMinutes: 1,
    formattedDate: "1 January 2026",
    published: true,
  };
}

describe("getAdjacentPosts - middle Post", () => {
  it("returns the newer neighbor as prev and the older neighbor as next", () => {
    // Given a newest-first ordered set [A, B, C]
    const [a, b, c] = ["a", "b", "c"].map(fixturePost);
    const posts = [a, b, c];

    // When adjacency is computed for the middle Post B
    const adjacency = getAdjacentPosts(posts, "b");

    // Then prev is the newer neighbor (A) and next is the older neighbor (C)
    expect(adjacency.prev).toEqual(a);
    expect(adjacency.next).toEqual(c);
  });
});

describe("getAdjacentPosts - boundary Posts", () => {
  it("has no prev (newer) side for the newest Post", () => {
    const [a, b, c] = ["a", "b", "c"].map(fixturePost);
    const posts = [a, b, c];

    const adjacency = getAdjacentPosts(posts, "a");

    expect(adjacency.prev).toBeUndefined();
    expect(adjacency.next).toEqual(b);
  });

  it("has no next (older) side for the oldest Post", () => {
    const [a, b, c] = ["a", "b", "c"].map(fixturePost);
    const posts = [a, b, c];

    const adjacency = getAdjacentPosts(posts, "c");

    expect(adjacency.prev).toEqual(b);
    expect(adjacency.next).toBeUndefined();
  });
});

describe("getAdjacentPosts - single-Post set", () => {
  it("returns neither prev nor next, with no error", () => {
    // Given a single-Post set
    const only = fixturePost("only");
    const posts = [only];

    // When adjacency is computed for the only Post
    const adjacency = getAdjacentPosts(posts, "only");

    // Then neither side is present and no error is thrown
    expect(adjacency.prev).toBeUndefined();
    expect(adjacency.next).toBeUndefined();
  });
});

describe("getAdjacentPosts - unknown slug", () => {
  it("returns neither prev nor next, with no error", () => {
    // Given a multi-Post set that does not contain the requested slug
    const [a, b, c] = ["a", "b", "c"].map(fixturePost);
    const posts = [a, b, c];

    // When adjacency is computed for a slug absent from the set
    const adjacency = getAdjacentPosts(posts, "does-not-exist");

    // Then neither side is present and no error is thrown
    expect(adjacency.prev).toBeUndefined();
    expect(adjacency.next).toBeUndefined();
  });
});

describe("getAdjacentPosts - consistent with buildPostSet ordering", () => {
  it("walks the same newest-first array buildPostSet produces, not a separate ordering", () => {
    // Given raw files whose newest-first order is [zebra, older] per byNewestThenSlug
    const files: RawPostFile[] = [
      rawFile("older.mdx", { title: "Older", dek: "d", date: "2026-01-10" }, "b"),
      rawFile("zebra.mdx", { title: "Zebra", dek: "d", date: "2026-03-02" }, "b"),
    ];
    const posts = buildPostSet(files);
    expect(posts.map((p) => p.slug)).toEqual(["zebra", "older"]);

    // When adjacency is computed for each Post over that same ordered array
    const zebraAdjacency = getAdjacentPosts(posts, "zebra");
    const olderAdjacency = getAdjacentPosts(posts, "older");

    // Then prev/next mirror the array's newest-first order - no separate ordering logic
    expect(zebraAdjacency.prev).toBeUndefined();
    expect(zebraAdjacency.next).toEqual(posts[1]);
    expect(olderAdjacency.prev).toEqual(posts[0]);
    expect(olderAdjacency.next).toBeUndefined();
  });
});

describe("buildPostSet - formatted date derivation", () => {
  it("derives a human display date from the ISO date, deterministically", () => {
    // Given a file with an ISO YYYY-MM-DD date
    const files: RawPostFile[] = [
      rawFile("dated.mdx", { title: "Dated", dek: "d", date: "2026-06-09" }, "b"),
    ];

    // When the pure core derives the display date
    const [post] = buildPostSet(files);

    // Then formattedDate is a stable, locale-independent display string
    expect(post.formattedDate).toBe("9 June 2026");
  });
});

describe("buildPostSet - coverImage validation (sec)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops an external-URL coverImage with a warning, still publishing the Post", () => {
    // Given a frontmatter coverImage that is an external (scheme) URL
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "ext-cover.mdx",
        { title: "T", dek: "d", date: "2026-01-01", coverImage: "https://evil.example.com/x.png" },
        "b"
      ),
    ];

    // When the loader validates frontmatter at the single gate
    const posts = buildPostSet(files);

    // Then the field is dropped with a build warning naming the file - no external fetch -
    // and the Post still publishes
    expect(posts).toHaveLength(1);
    expect(posts[0].coverImage).toBeUndefined();
    expect(posts[0].published).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("ext-cover.mdx"))).toBe(true);
  });

  it("drops a coverImage containing a '..' traversal segment with a warning", () => {
    // Given a site-relative-looking coverImage that smuggles a traversal segment
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "traversal-cover.mdx",
        { title: "T", dek: "d", date: "2026-01-01", coverImage: "/images/../../etc/passwd.png" },
        "b"
      ),
    ];

    // When the loader validates frontmatter
    const posts = buildPostSet(files);

    // Then the field is dropped with a warning - no path traversal into public/ siblings
    expect(posts).toHaveLength(1);
    expect(posts[0].coverImage).toBeUndefined();
    expect(warn.mock.calls.some((c) => String(c[0]).includes("traversal-cover.mdx"))).toBe(true);
  });

  it("drops a protocol-relative coverImage (//host) with a warning", () => {
    // Given a protocol-relative coverImage - it starts with "/" but resolves cross-origin
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "proto-rel-cover.mdx",
        { title: "T", dek: "d", date: "2026-01-01", coverImage: "//evil.example.com/x.png" },
        "b"
      ),
    ];

    // When the loader validates frontmatter
    const posts = buildPostSet(files);

    // Then it is dropped with a warning - a leading-"/" check alone would wrongly admit it
    expect(posts).toHaveLength(1);
    expect(posts[0].coverImage).toBeUndefined();
    expect(warn.mock.calls.some((c) => String(c[0]).includes("proto-rel-cover.mdx"))).toBe(true);
  });
});

describe("buildPostSet - hnUrl validation (sec)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps a valid Hacker News URL", () => {
    // Given frontmatter with a real news.ycombinator.com URL
    const files: RawPostFile[] = [
      rawFile(
        "hn-valid.mdx",
        {
          title: "T",
          dek: "d",
          date: "2026-01-01",
          hnUrl: "https://news.ycombinator.com/item?id=1",
        },
        "b"
      ),
    ];

    // When the loader validates frontmatter at the single gate
    const posts = buildPostSet(files);

    // Then the URL passes through unchanged
    expect(posts).toHaveLength(1);
    expect(posts[0].hnUrl).toBe("https://news.ycombinator.com/item?id=1");
  });

  it("drops a non-HN hnUrl with a warning, still publishing the Post", () => {
    // Given a frontmatter hnUrl pointing at a different domain
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "hn-invalid.mdx",
        { title: "T", dek: "d", date: "2026-01-01", hnUrl: "https://evil.example.com/x" },
        "b"
      ),
    ];

    // When the loader validates frontmatter
    const posts = buildPostSet(files);

    // Then the field is dropped with a build warning naming the file, and the Post still publishes
    expect(posts).toHaveLength(1);
    expect(posts[0].hnUrl).toBeUndefined();
    expect(posts[0].published).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("hn-invalid.mdx"))).toBe(true);
  });

  it("leaves hnUrl absent (undefined, no warning) when frontmatter omits it", () => {
    // Given frontmatter with no hnUrl field at all
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile("no-hn.mdx", { title: "T", dek: "d", date: "2026-01-01" }, "b"),
    ];

    // When the loader validates frontmatter
    const posts = buildPostSet(files);

    // Then hnUrl stays undefined and no warning fires
    expect(posts).toHaveLength(1);
    expect(posts[0].hnUrl).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("buildPostSet - categories validation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("omits an unknown category with a warning, keeping known ones and publishing the Post", () => {
    // Given frontmatter listing one vocabulary category and one unknown entry
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "cats.mdx",
        { title: "T", dek: "d", date: "2026-01-01", categories: "[Leadership, NotAThing]" },
        "b"
      ),
    ];

    // When the loader validates categories against the vocabulary
    const posts = buildPostSet(files);

    // Then the unknown entry is omitted (a warning names it), the known one is kept,
    // and the Post still publishes
    expect(posts).toHaveLength(1);
    expect(posts[0].categories).toEqual(["Leadership"]);
    expect(posts[0].published).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("NotAThing"))).toBe(true);
  });

  it("drops categories entirely with a warning when the frontmatter value isn't a list", () => {
    // Given frontmatter where `categories` is a scalar instead of a list
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const files: RawPostFile[] = [
      rawFile(
        "cats.mdx",
        { title: "T", dek: "d", date: "2026-01-01", categories: "Leadership" },
        "b"
      ),
    ];

    // When the loader validates categories against the vocabulary
    const posts = buildPostSet(files);

    // Then categories is dropped (undefined), a warning names the file, and the Post still publishes
    expect(posts).toHaveLength(1);
    expect(posts[0].categories).toBeUndefined();
    expect(posts[0].published).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("dropping categories"))).toBe(true);
  });

  it("dedupes repeated categories so a Post never carries the same one twice", () => {
    // Given frontmatter that repeats a valid vocabulary category
    const files: RawPostFile[] = [
      rawFile(
        "dupes.mdx",
        { title: "T", dek: "d", date: "2026-01-01", categories: "[AI, Leadership, AI]" },
        "b"
      ),
    ];

    // When the loader validates categories
    const [post] = buildPostSet(files);

    // Then the duplicate collapses, first-seen order preserved (no duplicate badge downstream)
    expect(post.categories).toEqual(["AI", "Leadership"]);
  });

  it("carries a valid site-relative coverImage and known categories onto the Post model", () => {
    // Given frontmatter with a valid `/…` coverImage and all-known categories
    const files: RawPostFile[] = [
      rawFile(
        "full.mdx",
        {
          title: "T",
          dek: "d",
          date: "2026-01-01",
          coverImage: "/images/profile.jpg",
          categories: "[Leadership, AI]",
        },
        "b"
      ),
    ];

    // When the pure core builds the set
    const [post] = buildPostSet(files);

    // Then both optional fields survive onto the typed Post, in authored order
    expect(post.coverImage).toBe("/images/profile.jpg");
    expect(post.categories).toEqual(["Leadership", "AI"]);
  });
});
