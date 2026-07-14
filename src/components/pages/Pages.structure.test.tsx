import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { domainAreas } from "@/data/domains";
import { ownerProfile } from "@/data/profile";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePost, samplePosts } from "@/stories/fixtures/posts";
import { Author } from "./Author";
import { Home } from "./Home";
import { SinglePost } from "./SinglePost";

/**
 * Structural guard (test_case: pages_import_organisms_only_no_reimplementation):
 * proves each Pages screen composes Task 006 organisms rather than
 * reimplementing their markup inline. Checks both that each file imports
 * from `@/components/ds/` (import-statement check) and that the rendered
 * DOM contains the organism's own structural markers (the `<article>`
 * wrapper `PostCard` owns, plus shadcn `data-slot` attributes owned by
 * `AuthorInfo`) — not a scan for the organism's copy strings, which
 * would pass for an unrelated reimplementation with different text and
 * fail on any unrelated copy edit.
 */

const PAGES_DIR = import.meta.dirname;

describe("Pages components — import organisms (structural)", () => {
  it.each([
    ["Home.tsx"],
    ["SinglePost.tsx"],
    ["Author.tsx"],
  ])("%s imports at least one organism from @/components/ds/", (file) => {
    const source = readFileSync(join(PAGES_DIR, file), "utf8");
    expect(source).toMatch(/@\/components\/ds\//);
  });
});

describe("Pages components — compose organisms, never reimplement them", () => {
  it("Home renders PostCard's own `article` structure per post, not hand-rolled markup", () => {
    const { container, unmount } = renderIntoDocument(
      <Home posts={samplePosts} navItems={sampleNavItems} />
    );

    expect(container.querySelectorAll("article")).toHaveLength(samplePosts.length);
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });

  it("Author composes the IdentityRail and DomainAreaPanel organisms plus PostCard's article structure", () => {
    const { container, unmount } = renderIntoDocument(
      <Author posts={samplePosts} navItems={sampleNavItems} />
    );

    // Composition, not reimplementation: each organism's own `data-slot` marker
    // proves the page mounts `ds/IdentityRail` / `ds/DomainAreaPanel` rather
    // than hand-rolling their markup inline.
    expect(container.querySelector('[data-slot="identity-rail"]')).not.toBeNull();
    expect(container.querySelector(`img[alt="${ownerProfile.imageAlt}"]`)).not.toBeNull();
    expect(container.querySelectorAll('[data-slot="domain-area-panel"]')).toHaveLength(
      domainAreas.length
    );
    expect(container.querySelectorAll("article")).toHaveLength(samplePosts.length);
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });

  it("SinglePost renders PostLayout's own AuthorInfo avatar and Newsletter form structure", () => {
    const { container, unmount } = renderIntoDocument(
      <SinglePost post={samplePost}>Body content</SinglePost>
    );

    expect(container.querySelector('[data-slot="avatar"]')).not.toBeNull();
    // AdsSpace was removed (Figma parity); PostLayout no longer composes any Card.
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(0);
    // Newsletter: the "Stories and interviews" signup form.
    expect(container.querySelector("form")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
