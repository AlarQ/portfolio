import { describe, expect, it } from "vitest";
import * as authorStories from "./Author.stories";
import * as blogListingStories from "./BlogListing.stories";
import * as homeStories from "./Home.stories";
import * as singlePostStories from "./SinglePost.stories";

/**
 * Guardrail (test_case: pages_stories_reflow_matches_figma_mobile_frame):
 * proves each Pages story exposes a `Mobile` variant declaring the Figma
 * "iPhone 15" viewport (390x844) via Storybook's built-in
 * `parameters.viewport` mechanism (behavior-level: the story declares the
 * mobile viewport — not a pixel-diff visual regression check; no snapshot
 * tooling exists in this repo). True visual-frame verification is a
 * manual/`/pr-review` concern.
 */
describe("Pages stories — declare the Figma iPhone 15 mobile viewport", () => {
  it.each([
    ["Home", homeStories],
    ["BlogListing", blogListingStories],
    ["SinglePost", singlePostStories],
    ["Author", authorStories],
  ])("%s exports a Mobile story with the iphone15 viewport parameter", (_name, stories) => {
    const mobile = (stories as Record<string, unknown>).Mobile as
      | { parameters?: { viewport?: { defaultViewport?: string } } }
      | undefined;
    expect(mobile).toBeDefined();
    expect(mobile?.parameters?.viewport?.defaultViewport).toBe("iphone15");
  });
});
