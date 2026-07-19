import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { domainAreas } from "@/data/domains";
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

  it("renders the About bio and every Domain Area (name, headline, achievements, skills)", () => {
    const { container, unmount } = renderIntoDocument(
      <Author posts={samplePosts} navItems={sampleNavItems} />
    );

    for (const paragraph of ownerProfile.bio) {
      expect(container.textContent).toContain(paragraph);
    }
    for (const area of domainAreas) {
      expect(container.textContent).toContain(area.name);
      expect(container.textContent).toContain(area.headline);
      for (const achievement of area.achievements) {
        expect(container.textContent).toContain(achievement.description);
      }
      for (const skill of area.skills) {
        expect(container.textContent).toContain(skill.name);
      }
    }

    unmount();
  });

  it("sources the author identity from the profile module, not a hardcode", () => {
    // FR-6 no-hardcode guard: the rendered name/title must equal the values in
    // `src/data/profile.ts`. Asserting `title` is load-bearing - the removed
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
