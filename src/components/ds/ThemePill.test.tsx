import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ThemePill } from "./ThemePill";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom in this project's vitest config has no localStorage backing
// (`--localstorage-file` not provided); next-themes reads/writes it to
// persist the choice across reloads. Minimal in-memory polyfill, test-only.
if (!window.localStorage) {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
    configurable: true,
  });
}

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
 * FR-7 acceptance #2: activating `ThemePill` flips theme light↔dark via the
 * `.dark` class mechanism (next-themes `setTheme`), mounted through the real
 * `ThemeProvider` (not a mocked `useTheme`) so this proves the actual wiring.
 */
describe("ThemePill toggles theme via next-themes (FR-7)", () => {
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

  it("themepill_toggles_dark_class_on_html_and_persists_across_reload", async () => {
    act(() => {
      root.render(
        <ThemeProvider>
          <ThemePill />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // next-themes persists the choice to localStorage under its default key
    // ("theme") — this is the mechanism that survives a real page reload.
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await act(async () => {
      button.click();
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
