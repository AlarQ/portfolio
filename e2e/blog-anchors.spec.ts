import { expect, test } from "@playwright/test";

/**
 * Heading id + hover/focus anchor E2E tests (FR-2).
 *
 * Post: my-spec-driven-workflow. Its first `##` heading is
 * "The boundary I keep pushing out", which rehype-slug (github-slugger
 * lowercasing/hyphenation) turns into the deterministic id
 * "the-boundary-i-keep-pushing-out".
 *
 * Scenarios: anchor-deep-link-resolves, heading-id-stable.
 */

const POST_PATH = "/blog/my-spec-driven-workflow";
const HEADING_ID = "the-boundary-i-keep-pushing-out";
const HEADING_TEXT = "The boundary I keep pushing out";

test.describe("Blog heading ids and anchors", () => {
  test("h2 carries a slug id and a hash URL resolves to and scrolls the heading into view", async ({
    page,
  }) => {
    await page.goto(POST_PATH);

    const heading = page.getByRole("heading", { name: HEADING_TEXT, level: 2 });
    await expect(heading).toHaveAttribute("id", HEADING_ID);

    await page.goto(`${POST_PATH}#${HEADING_ID}`);

    await expect(heading).toBeInViewport();
  });

  test("hovering a heading reveals a keyboard-focusable anchor with a visible focus ring, and activating it updates the URL hash", async ({
    page,
  }) => {
    await page.goto(POST_PATH);

    const heading = page.getByRole("heading", { name: HEADING_TEXT, level: 2 });
    const anchor = heading.getByRole("link", { name: "Link to this section" });

    await expect(anchor).toHaveCSS("opacity", "0");

    await heading.hover();
    await expect(anchor).toHaveCSS("opacity", "1");

    await anchor.focus();
    await expect(anchor).toHaveCSS("outline-style", "solid");

    await anchor.click();
    await expect(page).toHaveURL(new RegExp(`#${HEADING_ID}$`));
  });
});
