import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import preview from "../../.storybook/preview";

// Vitest's jsdom environment doesn't set this by default; without it React
// logs an "not configured to support act(...)" warning on every act() call.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Behavior 8 (this chunk's backlog): the Storybook scaffold must wrap every
 * story in the app's real `ThemeProvider` (`src/theme/ThemeProvider.tsx`), not
 * a story-local mock, so tasks 004-008 get MUI theme context for free without
 * re-deciding the adapter/provider question. Proxy for "real ThemeProvider is
 * mounted": `CssBaseline` injects a global Emotion `<style>` tag only when a
 * `MuiThemeProvider` actually wraps it.
 */
describe("storybook preview decorator wraps stories in the real ThemeProvider (behavior 8)", () => {
  const decorators = Array.isArray(preview.decorators)
    ? preview.decorators
    : preview.decorators
      ? [preview.decorators]
      : [];

  it("preview.decorators is non-empty", () => {
    expect(decorators.length).toBeGreaterThan(0);
  });

  it("wrapping a probe story with the decorator renders MUI's CssBaseline global styles", () => {
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

    expect(container.querySelector('[data-testid="probe"]')).not.toBeNull();
    // CssBaseline injects a global <style> tag via Emotion when MuiThemeProvider
    // is actually mounted above it — its absence would mean the decorator isn't
    // really wrapping stories in the app's ThemeProvider.
    const styleTags = Array.from(document.querySelectorAll("style"));
    expect(styleTags.length).toBeGreaterThan(0);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
