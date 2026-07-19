import { expect, type Locator } from "@playwright/test";

/**
 * Route-level token-resolution assertion (OQ-5, specs/route-migration/spec.md):
 * asserts a locator's computed style for `cssProperty` equals what that
 * property resolves to when set from the named semantic-token CSS custom
 * property - never a hardcoded rgb/hex literal in the spec itself. Survives
 * future palette edits (e.g. task 001's shiki rehoming) because the expected
 * value is derived from the live token, not pinned in the test.
 *
 * Shared across route-migration e2e tasks 004/005/006/010 - keep this the
 * one assertion helper for computed-style-vs-token checks.
 *
 * @param locator target element
 * @param cssProperty CSS property in kebab-case (e.g. "color", "background-color")
 * @param tokenVarName semantic-token CSS custom property, e.g. "--shiki-token-comment"
 */
export async function expectComputedStyleMatchesToken(
  locator: Locator,
  cssProperty: string,
  tokenVarName: string
): Promise<void> {
  const { actual, resolved } = await locator.evaluate(
    (el, args) => {
      const tokenValue = getComputedStyle(document.documentElement)
        .getPropertyValue(args.tokenVarName)
        .trim();

      // Round-trip the raw token value (often a hex literal) through a probe
      // element so it's normalized to the browser's computed-style format
      // (e.g. "rgb(r, g, b)") before comparing.
      const probe = document.createElement("div");
      probe.style.setProperty(args.cssProperty, tokenValue);
      document.body.appendChild(probe);
      const resolvedValue = getComputedStyle(probe).getPropertyValue(args.cssProperty);
      probe.remove();

      return {
        actual: getComputedStyle(el).getPropertyValue(args.cssProperty),
        resolved: resolvedValue,
      };
    },
    { cssProperty, tokenVarName }
  );

  expect(actual).toBe(resolved);
}
