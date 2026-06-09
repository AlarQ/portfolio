import { describe, expect, it } from "vitest";
import { buildPostSet, type RawPostFile } from "./postLoader";

/**
 * Unit tests for the pure core `buildPostSet(rawFiles): Post[]`.
 *
 * These feed RAW-FILE FIXTURES (filename + raw file content) to the pure core
 * — no filesystem — and assert the WHOLE returned Post set in one place:
 * frontmatter parsing, derivations (slug, reading time, formatted date,
 * published), newest-first ordering, and slug-gate exclusions.
 */

function rawFile(filename: string, frontmatter: Record<string, string>, body: string): RawPostFile {
  const fm = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return { filename, content: `---\n${fm}\n---\n\n${body}\n` };
}

describe("buildPostSet — frontmatter parsing", () => {
  it("returns Posts whose authored fields equal the frontmatter values", () => {
    // Given a raw MDX file carrying { title, dek, date } frontmatter
    const files: RawPostFile[] = [
      rawFile(
        "hello-world.mdx",
        {
          title: "Hello World",
          dek: "The first post on the blog.",
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
    expect(post.title).toBe("Hello World");
    expect(post.dek).toBe("The first post on the blog.");
    expect(post.date).toBe("2026-06-09");
    expect(post.slug).toBe("hello-world");
  });
});

describe("buildPostSet — reading time derivation", () => {
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

describe("buildPostSet — ordering", () => {
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

describe("buildPostSet — published by presence", () => {
  it("includes a slug-valid file and marks it published (no separate draft flag)", () => {
    // Given a single slug-valid file present in the set
    const files: RawPostFile[] = [
      rawFile("present.mdx", { title: "Present", dek: "d", date: "2026-02-02" }, "b"),
    ];

    // When the pure core builds the set
    const posts = buildPostSet(files);

    // Then it is included and published is true purely by its presence
    expect(posts).toHaveLength(1);
    expect(posts[0].published).toBe(true);
  });
});

describe("buildPostSet — slug gate", () => {
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

    // Then only the slug-valid file survives — invalid slugs are unrepresentable
    expect(posts.map((p) => p.slug)).toEqual(["valid-slug"]);
    expect(posts.every((p) => /^[a-z0-9-]+$/.test(p.slug))).toBe(true);
  });
});

describe("buildPostSet — formatted date derivation", () => {
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
