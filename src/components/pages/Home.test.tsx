import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePosts } from "@/stories/fixtures/posts";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the Figma blog index: masthead, one PostCard article per post, footer, no inline newsletter", () => {
    const { container, unmount } = renderIntoDocument(
      <Home posts={samplePosts} navItems={sampleNavItems} />
    );

    // Masthead is the `ds/Header` title band, not a hand-rolled <h1>.
    expect(container.textContent).toContain("THE BLOG");

    // Every Post renders exactly once across the Recent + All sections.
    expect(container.querySelectorAll("article")).toHaveLength(samplePosts.length);
    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
    }

    expect(container.querySelector("footer")).not.toBeNull();

    // The blog index frame has no inline Newsletter block (the only <form>).
    expect(container.querySelector("form")).toBeNull();

    unmount();
  });

  it("omits Pagination when the Post set fits on one page", () => {
    const { container, unmount } = renderIntoDocument(
      <Home posts={samplePosts} navItems={sampleNavItems} />
    );

    expect(container.querySelector("nav[aria-label='Pagination']")).toBeNull();

    unmount();
  });

  it("renders each PostCard's real per-Post cover + category badges, and omits both when absent", () => {
    const { container, unmount } = renderIntoDocument(
      <Home posts={samplePosts} navItems={sampleNavItems} />
    );

    // samplePosts[0] carries a real coverImage + categories — its cover image
    // and vocabulary badges must render.
    const withCoverAndCategories = samplePosts[0];
    expect(withCoverAndCategories.coverImage).toBeDefined();
    expect(withCoverAndCategories.categories?.length).toBeGreaterThan(0);
    const images = Array.from(container.querySelectorAll("img"));
    expect(images.some((img) => img.getAttribute("src")?.includes("profile"))).toBe(true);
    for (const category of withCoverAndCategories.categories ?? []) {
      expect(container.textContent).toContain(category);
    }

    // Every other sample Post has no coverImage/categories — no card should
    // render more cover images or badges than the one Post that has them.
    const withoutCoverOrCategories = samplePosts.slice(1);
    for (const post of withoutCoverOrCategories) {
      expect(post.coverImage).toBeUndefined();
      expect(post.categories).toBeUndefined();
    }
    expect(images).toHaveLength(1);

    unmount();
  });
});
