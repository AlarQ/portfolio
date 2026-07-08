import { expect, test } from "@playwright/test";
import {
  type StorybookStaticServer,
  startStorybookStaticServer,
} from "./support/storybookStaticServer";

/**
 * ADR-DS-2, behavior 4 (`emotion_wins_cascade_ties_via_injectfirst`). Proves
 * the *resolved computed style*, not just `@layer` declaration order (that
 * weaker check already lives in `e2e/coexistence.spec.ts`). Mounts
 * `CascadeTieFixtureCard` — one element with both a colliding Tailwind
 * utility class (`bg-red-600`) and an Emotion/MUI `sx` background
 * (`brand.orange`) — through the real provider stack
 * (`AppRouterCacheProvider options={{ enableCssLayer: true }}` +
 * `ThemeProvider`) via its Storybook story, and asserts the computed
 * `background-color` is MUI's `brand.orange`, not Tailwind's `bg-red-600`.
 * Uses the shared static-Storybook harness (`support/storybookStaticServer.ts`),
 * the same one `e2e/storybook-adapter.spec.ts` uses.
 */
let storybookServer: StorybookStaticServer;

test.beforeAll(async () => {
  storybookServer = await startStorybookStaticServer("storybook-e2e-cascade-");
});

test.afterAll(async () => {
  await storybookServer.close();
});

test("MUI sx background wins the cascade tie against a colliding Tailwind utility class", async ({
  page,
}) => {
  await page.goto(
    `${storybookServer.baseUrl}/iframe.html?id=internal-cascadetiefixturecard--default&viewMode=story`
  );

  const fixture = page.getByTestId("cascade-tie-fixture");
  await expect(fixture).toBeVisible();

  const backgroundColor = await fixture.evaluate((el) => getComputedStyle(el).backgroundColor);

  // brand.orange = #f97316 -> rgb(249, 115, 22). Tailwind's bg-red-600 is
  // rgb(220, 38, 38) — a distinctly different value, so this assertion can
  // only pass if MUI actually won the tie, not by color-value coincidence.
  expect(backgroundColor).toBe("rgb(249, 115, 22)");
});
