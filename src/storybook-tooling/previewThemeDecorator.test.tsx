import type { Preview } from "@storybook/nextjs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

// `.storybook/preview.tsx` calls `Inter()` from `next/font/google` at module
// load (mirroring `layout.tsx` to stamp `--font-inter`). next/font is a build-
// time loader with no runtime under vitest, so stub it to return the shape the
// preview consumes (`.variable`) - otherwise the import throws "Inter is not a
// function" before any test runs.
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
}));

import preview from "../../.storybook/preview";

function getDecorators(preview: Preview) {
  return Array.isArray(preview.decorators)
    ? preview.decorators
    : preview.decorators
      ? [preview.decorators]
      : [];
}

// Vitest's jsdom environment doesn't set this by default; without it React
// logs an "not configured to support act(...)" warning on every act() call.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type StoryContext = Parameters<ReturnType<typeof getDecorators>[number]>[1];

/**
 * The decorator now calls hooks (`useEffect`) in its body, so it MUST be
 * invoked inside a React render, not called as a plain function. Wrap the
 * `decorator(Story, ctx)` call in a component and mount it under `act()` so the
 * hook registers and its effect flushes (mirroring how Storybook renders it).
 */
function renderDecorated(
  decorator: ReturnType<typeof getDecorators>[number],
  ctx: Partial<StoryContext>,
  testid: string
) {
  const Probe = () => <div data-testid={testid}>probe</div>;
  const Decorated = () => decorator(Probe, ctx as StoryContext) as React.ReactElement;

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Decorated />);
  });

  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

// The decorator writes theme state onto the document root/body (see below), so
// reset it between tests to keep them independent.
afterEach(() => {
  document.documentElement.classList.remove("dark");
  document.body.removeAttribute("style");
});

/**
 * Behavior 8 (revised for Task 004+): the shadcn primitives are the Figma
 * *light* look and render on the raw light tokens from `globals.css` - they
 * MUST NOT be wrapped in the legacy MUI dark `ThemeProvider`, whose
 * `CssBaseline` paints a dark `body` and inverts every story vs Figma (see the
 * rationale in `.storybook/preview.tsx`). So the decorator's contract is now:
 * render the story under a div carrying the `--font-inter` variable, with no
 * MUI `CssBaseline` global `<style>` injected.
 */
describe("storybook preview decorator renders stories on the raw light tokens (behavior 8)", () => {
  const decorators = getDecorators(preview);

  it("preview.decorators is non-empty", () => {
    expect(decorators.length).toBeGreaterThan(0);
  });

  it("wraps a probe story in the Inter font variable div and injects no MUI baseline", () => {
    const decorator = decorators[0];
    if (!decorator) throw new Error("expected at least one decorator");

    const { container, cleanup } = renderDecorated(decorator, {}, "probe");

    const probe = container.querySelector('[data-testid="probe"]');
    expect(probe).not.toBeNull();
    // The story renders under the decorator's font wrapper, which carries the
    // `--font-inter` variable so primitives inherit real Inter (matching Figma).
    const fontWrapper = probe?.closest('[class*="font-inter"]');
    expect(fontWrapper).not.toBeNull();
    // And crucially NO MUI ThemeProvider/CssBaseline: the legacy dark baseline
    // would inject a global Emotion <style> and invert every story vs Figma.
    const styleTags = Array.from(document.querySelectorAll("style"));
    expect(styleTags.length).toBe(0);

    cleanup();
  });
});

/**
 * Task 008 (FR-9 acceptance #1, Storybook demo half): a `globalTypes` toolbar
 * item lets a reviewer flip themes in Storybook's UI, and the decorator toggles
 * the `dark` class on the document root (`<html>`) - no next-themes/
 * ThemeProvider needed here, since `tokens.css`'s `.dark {}` block is a plain
 * class selector that cascades to any element (not just `:root`) carrying the
 * class. The class lives on the document root (not the story wrapper) so the
 * full-canvas dark fill survives regardless of each story's `parameters.layout`.
 */
describe("storybook theme toolbar toggles the dark class on the document root (Task 008)", () => {
  it("registers a theme globalType with a toolbar", () => {
    expect(preview.globalTypes?.theme).toBeDefined();
    expect(preview.globalTypes?.theme?.toolbar).toBeDefined();
  });

  it("defaults to light: no dark class on the document root when globals.theme is light", () => {
    const decorators = getDecorators(preview);
    const decorator = decorators[0];
    if (!decorator) throw new Error("expected at least one decorator");

    const { cleanup } = renderDecorated(decorator, { globals: { theme: "light" } }, "probe-light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    cleanup();
  });

  it("adds the dark class to the document root when globals.theme is dark", () => {
    const decorators = getDecorators(preview);
    const decorator = decorators[0];
    if (!decorator) throw new Error("expected at least one decorator");

    const { cleanup } = renderDecorated(decorator, { globals: { theme: "dark" } }, "probe-dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    cleanup();
  });
});
