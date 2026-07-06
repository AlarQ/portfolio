import { useTheme } from "next-themes";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no `matchMedia`; next-themes calls it (system-preference listener)
// even with `enableSystem={false}`. Minimal polyfill, test-only.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * FR-9 acceptance #1: `next-themes` mounts the `class` strategy on `<html>`,
 * default light, fully decoupled from the MUI ThemeProvider/CssBaseline
 * (mirrors the Tailwind/MUI coexistence pattern — see coexistence.test.ts).
 * Mounts via `react-dom/client` directly (project convention, see
 * `src/components/ds/testUtils.tsx`) rather than pulling in
 * `@testing-library/react`, which is not a project dependency.
 */
function ThemeToggleProbe() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      data-testid="toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme}
    </button>
  );
}

describe("ThemeProvider mounts next-themes on the html class (FR-9)", () => {
  let container: HTMLDivElement;
  // biome-ignore lint/suspicious/noExplicitAny: react-dom Root type not exported cleanly for this local test helper
  let root: any;

  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.documentElement.classList.remove("dark");
  });

  it("dark_class_swaps_semantic_tokens_and_components_rerender", async () => {
    act(() => {
      root.render(
        <ThemeProvider>
          <ThemeToggleProbe />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    const button = container.querySelector('[data-testid="toggle"]') as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await act(async () => {
      button.click();
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
