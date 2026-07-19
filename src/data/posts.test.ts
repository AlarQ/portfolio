import { afterEach, describe, expect, it, vi } from "vitest";
import type { Post } from "./posts";
import { getPost, getPosts } from "./posts";

// Shared, hoisted state the ./postLoader mock reads. When `posts` is set, the
// mocked buildPostSet returns that fixture set (so getPosts exercises its real
// NODE_ENV gate + selectVisiblePosts over a set that actually contains a draft);
// when null it passes through to the real buildPostSet so the getPost suite reads
// the true content/posts corpus.
const state = vi.hoisted(() => ({ posts: null as Post[] | null }));

vi.mock("./postLoader", async (importActual) => {
  const actual = await importActual<typeof import("./postLoader")>();
  return {
    ...actual,
    buildPostSet: (raw: Parameters<typeof actual.buildPostSet>[0]) =>
      state.posts ?? actual.buildPostSet(raw),
  };
});

describe("getPost - single per-slug lookup over the loader's Post set", () => {
  it("returns the one Post whose slug matches a published candidate", () => {
    // Given a slug present in the loader's validated set
    const [first] = getPosts();

    // When the route asks for that single Post
    const post = getPost(first.slug);

    // Then it is the same Post the loader exposes - one lookup, one source
    expect(post).toEqual(first);
  });

  it("returns undefined for a slug with no Post (the detail route 404s)", () => {
    expect(getPost("no-such-post-slug")).toBeUndefined();
  });
});

describe("getPosts - draft visibility gate (dev vs production)", () => {
  function post(slug: string, published: boolean): Post {
    return {
      slug,
      title: slug,
      dek: "d",
      date: "2026-02-02",
      readingTimeMinutes: 1,
      formattedDate: "2 February 2026",
      published,
    };
  }

  // A set with one published and one draft (unpublished) Post, newest-first.
  const fixtureSet: Post[] = [post("live-post", true), post("draft-post", false)];

  afterEach(() => {
    state.posts = null;
    vi.unstubAllEnvs();
  });

  it("excludes the draft Post in production, keeping only published Posts", () => {
    // Given a set containing a draft, in a production build
    state.posts = fixtureSet;
    vi.stubEnv("NODE_ENV", "production");

    // When getPosts applies its environment gate
    const slugs = getPosts().map((p) => p.slug);

    // Then the draft is excluded at the source - only the published Post survives
    expect(slugs).toEqual(["live-post"]);
    expect(slugs).not.toContain("draft-post");
  });

  it("includes the draft Post in the dev environment", () => {
    // Given the same set, but running in dev (NODE_ENV !== "production")
    state.posts = fixtureSet;
    vi.stubEnv("NODE_ENV", "development");

    // When getPosts applies its environment gate
    const slugs = getPosts().map((p) => p.slug);

    // Then the draft is visible alongside the published Post
    expect(slugs).toEqual(["live-post", "draft-post"]);
  });
});
