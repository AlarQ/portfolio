import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { ownerProfile } from "@/data/profile";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePosts } from "@/stories/fixtures/posts";
import { Author } from "./Author";

describe("Author", () => {
  it("renders a full screen composing the identity rail, that author's PostCards, and the Footer", () => {
    const { container, unmount } = renderIntoDocument(
      <Author posts={samplePosts} navItems={sampleNavItems} />
    );

    expect(container.querySelector(`img[alt="${ownerProfile.imageAlt}"]`)).not.toBeNull();
    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
    }
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });

  it("renders the About bio and every experience area from the profile module", () => {
    const { container, unmount } = renderIntoDocument(
      <Author posts={samplePosts} navItems={sampleNavItems} />
    );

    expect(container.textContent).toContain(ownerProfile.bio);
    for (const area of ownerProfile.experienceAreas) {
      expect(container.textContent).toContain(area.heading);
      for (const highlight of area.highlights) {
        expect(container.textContent).toContain(highlight);
      }
    }

    unmount();
  });

  it("sources the author identity from the profile module, not a hardcode", () => {
    // FR-6 no-hardcode guard: the rendered name/title must equal the values in
    // `src/data/profile.ts`. Asserting `title` is load-bearing — the removed
    // literal was `title="Author"`, so tracking `ownerProfile.title`
    // ("SOFTWARE ENGINEER") proves AuthorInfo is fed from the module, not the
    // old `<AuthorInfo name="Ernest Bednarczyk" title="Author">` hardcode.
    const { container, unmount } = renderIntoDocument(
      <Author posts={samplePosts} navItems={sampleNavItems} />
    );

    expect(container.textContent).toContain(ownerProfile.name);
    expect(container.textContent).toContain(ownerProfile.title);

    unmount();
  });
});
