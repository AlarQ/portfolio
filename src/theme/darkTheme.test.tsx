import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { primitives } from "./tokens";

/**
 * FR-9: proves the `.dark` class actually swaps semantic CSS-var values at the
 * DOM level (jsdom + getComputedStyle), not just a structural/string check on
 * `tokens.css`. Loads the real generated stylesheet into a `<style>` tag so
 * this test fails if the generator or token maps regress the cascade.
 */
describe("dark class swaps semantic tokens (FR-9)", () => {
  let styleEl: HTMLStyleElement;

  beforeEach(() => {
    const css = readFileSync(join(process.cwd(), "src/theme/tokens.css"), "utf-8");
    styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  });

  afterEach(() => {
    styleEl.remove();
    document.documentElement.classList.remove("dark");
  });

  /**
   * jsdom's CSS engine does not resolve `var()` references inside
   * `getComputedStyle` shorthand properties (e.g. `backgroundColor`), but it
   * does correctly cascade-match `:root`/`.dark` selectors and report the
   * *custom property's own* resolved value via `getPropertyValue`. Reading the
   * custom properties directly (rather than a color property that embeds a
   * `var()`) is the real, non-string-based proxy for "the class swap changed
   * which rule wins" available in this environment.
   */
  it("dark_class_swaps_semantic_tokens_and_reverts_on_removal", () => {
    document.documentElement.classList.remove("dark");
    const light = getComputedStyle(document.documentElement);
    expect(light.getPropertyValue("--background").trim()).toBe("var(--white)");
    expect(light.getPropertyValue("--foreground").trim()).toBe("var(--heading-light)");
    expect(light.getPropertyValue("--white").trim()).toBe(primitives.white);
    expect(light.getPropertyValue("--heading-light").trim()).toBe(primitives.headingLight);

    document.documentElement.classList.add("dark");
    const dark = getComputedStyle(document.documentElement);
    expect(dark.getPropertyValue("--background").trim()).toBe("var(--background-dark)");
    expect(dark.getPropertyValue("--foreground").trim()).toBe("var(--heading-dark)");
    expect(dark.getPropertyValue("--background-dark").trim()).toBe(primitives.backgroundDark);
    expect(dark.getPropertyValue("--heading-dark").trim()).toBe(primitives.headingDark);

    document.documentElement.classList.remove("dark");
    const reverted = getComputedStyle(document.documentElement);
    expect(reverted.getPropertyValue("--background").trim()).toBe("var(--white)");
    expect(reverted.getPropertyValue("--foreground").trim()).toBe("var(--heading-light)");
  });
});
