import { describe, expect, it } from "vitest";
import { getPost, getPosts } from "./posts";

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
