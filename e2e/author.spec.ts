import { expect, test } from "@playwright/test";
import { ownerProfile } from "@/data/profile";

/**
 * FR-6 (scenario author-page-renders): `/author` renders `pages/Author` with
 * the owner's identity sourced from `src/data/profile.ts` - not a hardcode.
 * The name/title are read from the profile module here so this contract keeps
 * proving "data-driven" even if the owner's identity is edited. Header/Footer
 * chrome is Task 006's contract and is not re-asserted here.
 */
test.describe("Author page", () => {
  test("renders the owner's display name and title from the profile module", async ({ page }) => {
    await page.goto("/author");

    await expect(page.getByText(ownerProfile.name).first()).toBeVisible();
    await expect(page.getByText(ownerProfile.title).first()).toBeVisible();
  });
});
