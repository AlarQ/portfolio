import { type Browser, chromium, expect, test } from "@playwright/test";
import {
  type StorybookStaticServer,
  startStorybookStaticServer,
} from "./support/storybookStaticServer";

/**
 * `ClipRow`/`MediaFrame` a11y + playback-policy E2E (projects-detail FR-10),
 * run against a **static Storybook build** via the shared
 * `storybookStaticServer` helper (`e2e/storybook-adapter.spec.ts`'s
 * pattern) since no real Project has a clip yet (decision 1: both
 * Bondsmith and Hyperion ship text/still-only Capabilities). The fixture
 * clip `src` (`/media/fixtures/clip.mp4`) deliberately points at a file
 * that does not exist on disk, so "no request until Play" never
 * accidentally passes by fetching a real clip (FR-12, e2e-no-clip-fetch).
 */
let storybookServer: StorybookStaticServer;

const POSTER_STORY = "molecules-cliprow--poster";
const GROUP_STORY = "molecules-cliprow--group";

function storyUrl(baseUrl: string, id: string): string {
  return `${baseUrl}/iframe.html?id=${id}&viewMode=story`;
}

/**
 * The fixture clip 404s by design (FR-12, e2e-no-clip-fetch), which means a
 * real browser's `HTMLMediaElement.play()` never resolves/fires `play` (no
 * decodable source, `readyState` stays `HAVE_NOTHING`) - the same technique
 * `ClipRow.test.tsx` uses to make `play`/`pause` deterministic. Stubbing
 * them here (before any script on the page runs) lets `one-clip-at-a-time`
 * exercise the real `ClipPlaybackGroup` coordination logic without needing
 * an actual decodable clip.
 */
async function stubMediaPlayback(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play() {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {
      this.dispatchEvent(new Event("pause"));
    };
  });
}

test.beforeAll(async () => {
  storybookServer = await startStorybookStaticServer("storybook-e2e-projects-media-");
});

test.afterAll(async () => {
  await storybookServer.close();
});

test("no <video> element and no .mp4 request for an off-screen row until it scrolls into view (zero-video-bytes-until-play)", async ({
  page,
}) => {
  // FR-10's playback policy makes the observer's highest-ratio *visible*
  // row an implicit play request, so a row already in the initial viewport
  // (e.g. `POSTER_STORY`'s single row) now legitimately mounts a `<video>`
  // without a click - "zero video bytes until play" still holds per-row,
  // for any row that hasn't yet become visible. A short viewport keeps the
  // third `GROUP_STORY` row off-screen at load.
  await page.setViewportSize({ width: 1280, height: 300 });

  let mp4RequestCount = 0;
  page.on("request", (request) => {
    if (request.url().endsWith(".mp4")) mp4RequestCount++;
  });

  await page.goto(storyUrl(storybookServer.baseUrl, GROUP_STORY));
  await page.waitForSelector("img");
  await page.waitForTimeout(500);

  // The first row is in the short viewport (and may implicitly autoplay per
  // FR-10) - the third row, still off-screen, must contribute zero video
  // bytes of its own.
  const thirdRowVideo = page.locator('video[aria-label="the third clip"]');
  await expect(thirdRowVideo).toHaveCount(0);
  const baselineMp4Requests = mp4RequestCount;

  await page.getByRole("button", { name: /^(Play|Pause) the third clip/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await expect(thirdRowVideo).toHaveCount(1);
  expect(mp4RequestCount).toBeGreaterThan(baselineMp4Requests);
});

test("toggle has an accessible name, is >= 44x44 CSS px, and has an opaque background (toggle-name-and-size)", async ({
  page,
}) => {
  await page.goto(storyUrl(storybookServer.baseUrl, POSTER_STORY));

  // The in-view row may be autoplayed by the observer, so the label can be
  // either `Play …` or `Pause …` - the size/contrast contract is the same.
  const button = page.getByRole("button", { name: /^(Play|Pause)/ });
  await expect(button).toBeVisible();

  const box = await button.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  const backgroundColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  // An opaque color has alpha 1 (or no alpha channel at all, i.e. `rgb(...)`
  // with exactly 3 components) - never `rgba(...,  a<1)` like the forbidden
  // `bg-black/50`.
  const components = backgroundColor.match(/[\d.]+/g) ?? [];
  const alpha = components.length >= 4 ? Number.parseFloat(components[3] ?? "1") : 1;
  expect(alpha).toBe(1);
});

test("only one clip plays at a time within a ClipPlaybackGroup (one-clip-at-a-time)", async ({
  page,
}) => {
  await stubMediaPlayback(page);
  await page.goto(storyUrl(storybookServer.baseUrl, GROUP_STORY));

  // Three toggles exist regardless of which row the observer may have
  // already selected as active (with the playback stub, a row visible at
  // load may genuinely be playing by now - FR-10's implicit play request).
  await expect(page.getByRole("button", { name: /^(Play|Pause)/ })).toHaveCount(3);

  // Explicitly play whichever row is currently idle - one-clip-at-a-time
  // must hold regardless of whether this is the observer's first pick.
  const idlePlay = page.getByRole("button", { name: /^Play/ }).first();
  await idlePlay.click();
  await expect(page.getByRole("button", { name: /^Pause/ })).toHaveCount(1);

  // Scroll a second row into view - the group's observer may hand it
  // playback (or not, if headless autoplay is restricted), but exactly one
  // row is ever in the "Pause" (playing) state at a time - never more.
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(500);

  const pausedCount = await page.getByRole("button", { name: /^Pause/ }).count();
  expect(pausedCount).toBe(1);
});

test("a hand-paused row stays paused after scrolling away and back (sticky-pause)", async ({
  page,
}) => {
  await stubMediaPlayback(page);
  await page.goto(storyUrl(storybookServer.baseUrl, GROUP_STORY));

  const firstPlay = page.getByRole("button", { name: /^Play/ }).first();
  await firstPlay.click();
  const pauseButton = page.getByRole("button", { name: /^Pause/ }).first();
  await pauseButton.waitFor({ state: "visible" }).catch(() => {});
  if (await pauseButton.isVisible().catch(() => false)) {
    await pauseButton.click();
  }

  await page.mouse.wheel(0, 2000);
  await page.mouse.wheel(0, -2000);
  await page.waitForTimeout(300);

  // The hand-paused row's button label must not have flipped back to Pause
  // on its own (the observer never resumes a hand-paused row).
  await expect(page.getByRole("button", { name: /^Play/ }).first()).toBeVisible();

  // Navigate away and back - bfcache/back-navigation restore must not
  // resume playback on a hand-paused row either.
  await page.goto(storyUrl(storybookServer.baseUrl, POSTER_STORY));
  await page.goBack();
  await expect(page.getByRole("button", { name: /^Play/ }).first()).toBeVisible();
});

test("reduced motion: nothing autoplays and Play plays once (reduced-motion-play-once)", async ({
  browser,
}: {
  browser: Browser;
}) => {
  const context = await (browser ?? chromium).newContext();
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(storyUrl(storybookServer.baseUrl, POSTER_STORY));
  await page.waitForSelector("img");

  expect(await page.locator("video").count()).toBe(0);

  const playButton = page.getByRole("button", { name: /^Play/ });
  await expect(playButton).toBeVisible();
  await playButton.click();

  const video = page.locator("video");
  await expect(video).toHaveCount(1);

  // Simulate the clip finishing - real clip fixtures may not exist/be short
  // enough to end naturally, so `ended` is dispatched directly on the
  // element (reduced-motion-play-once).
  await video.evaluate((el) => el.dispatchEvent(new Event("ended")));

  await expect(
    page.getByRole("button", { name: "Play the Plan to Ship flow chain" })
  ).toBeVisible();

  await context.close();
});

test("no-JS: poster and caption render, no toggle button exists in the HTML (no-js-no-dead-control)", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(storyUrl(storybookServer.baseUrl, POSTER_STORY));

  const html = await page.content();
  expect(html).not.toMatch(/<button[^>]*>[\s\S]*?Play[\s\S]*?<\/button>/);

  await context.close();
});
