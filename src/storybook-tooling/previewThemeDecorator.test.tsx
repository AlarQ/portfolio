import type { Preview } from "@storybook/nextjs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

// `.storybook/preview.tsx` calls `Inter()` from `next/font/google` at module
// load (mirroring `layout.tsx` to stamp `--font-inter`). next/font is a build-
// time loader with no runtime under vitest, so stub it to return the shape the
// preview consumes (`.variable`) — otherwise the import throws "Inter is not a
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

/**
 * Behavior 8 (revised for Task 004+): the shadcn primitives are the Figma
 * *light* look and render on the raw light tokens from `globals.css` — they
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

    const Probe = () => <div data-testid="probe">probe</div>;
    // Minimal story-context stub — sufficient for this decorator's signature.
    const decorated = decorator(Probe, {} as never);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(decorated);
    });

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

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});

/**
 * Task 008 (FR-9 acceptance #1, Storybook demo half): a `globalTypes` toolbar
 * item lets a reviewer flip themes in Storybook's UI, and the decorator toggles
 * the `dark` class on the same font-wrapper div the decorator already renders
 * — no next-themes/ThemeProvider needed here, since `tokens.css`'s `.dark {}`
 * block is a plain class selector that cascades to any element (not just
 * `:root`) carrying the class.
 */
describe("storybook theme toolbar toggles the dark class on the story wrapper (Task 008)", () => {
  it("registers a theme globalType with a toolbar", () => {
    expect(preview.globalTypes?.theme).toBeDefined();
    expect(preview.globalTypes?.theme?.toolbar).toBeDefined();
  });

  it("defaults to light: no dark class when globals.theme is unset or light", () => {
    const decorators = getDecorators(preview);
    const decorator = decorators[0];
    if (!decorator) throw new Error("expected at least one decorator");

    const Probe = () => <div data-testid="probe-light">probe</div>;
    const decorated = decorator(Probe, { globals: { theme: "light" } } as never);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(decorated);
    });

    const probe = container.querySelector('[data-testid="probe-light"]');
    expect(probe?.closest(".dark")).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("adds the dark class to the wrapper when globals.theme is dark", () => {
    const decorators = getDecorators(preview);
    const decorator = decorators[0];
    if (!decorator) throw new Error("expected at least one decorator");

    const Probe = () => <div data-testid="probe-dark">probe</div>;
    const decorated = decorator(Probe, { globals: { theme: "dark" } } as never);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(decorated);
    });

    const probe = container.querySelector('[data-testid="probe-dark"]');
    expect(probe?.closest(".dark")).not.toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
