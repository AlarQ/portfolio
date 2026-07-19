import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { mdxComponents } from "./mdxPresentation";

/**
 * Token-discipline guard for the MDX presentation seams (route migration FR-3).
 * These modules render Post body prose and MUST bind their colors/spacing to the
 * semantic Tailwind token layer (`src/theme/tokens.ts` → `bg-*`, `text-*`,
 * `border-*`) - never a raw hex/`rgb()` literal, never an MUI `sx=` prop, never
 * an `@mui/*` import, and never the legacy `brand` color seam. That keeps a
 * color change a one-place edit in the token source (CLAUDE.md design-token
 * rules) rather than scattered across MUI `sx` objects. `Callout.tsx` lives at
 * the same seam and is scanned alongside the two `utils/` modules.
 */

const SEAM_FILES = [
  "utils/mdxPresentationText.tsx",
  "utils/mdxPresentationBlock.tsx",
  "components/Callout.tsx",
];

/** A raw hex color literal, e.g. `#0ea5e9` or `#fff`. */
const HEX_LITERAL = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

/** A hand-typed rgb()/rgba() call - colors must resolve through semantic tokens. */
const RGB_LITERAL = /\brgba?\(\s*\d/g;

/** An MUI `sx=` styling prop - replaced by token-bound Tailwind `className`. */
const SX_PROP = /\bsx=/;

/** Any `@mui/*` import - the seam is plain Tailwind-styled elements now. */
const MUI_IMPORT = /@mui\//;

/** The legacy `brand` color seam - the semantic token layer replaces it here. */
const BRAND_TOKEN = /\bbrand\b/;

describe("mdx presentation seams - token-bound Tailwind only, no MUI styling", () => {
  for (const file of SEAM_FILES) {
    it(`${file} carries no raw color literal, sx= prop, @mui import, or brand token`, () => {
      const source = readFileSync(join(process.cwd(), "src", file), "utf-8");

      expect(source.match(HEX_LITERAL), `${file} must not contain a raw hex literal`).toBeNull();
      expect(
        source.match(RGB_LITERAL),
        `${file} must not contain a hand-typed rgb()/rgba() literal - use semantic tokens`
      ).toBeNull();
      expect(SX_PROP.test(source), `${file} must not carry an MUI sx= prop`).toBe(false);
      expect(MUI_IMPORT.test(source), `${file} must not import from @mui/*`).toBe(false);
      expect(
        BRAND_TOKEN.test(source),
        `${file} must not import the legacy brand color seam - bind semantic tokens`
      ).toBe(false);
    });
  }
});

/**
 * Trust-boundary locks (ADR-0001 / ADR-RM-1, spec scenarios sec-script-neutralized,
 * sec-iframe-neutralized, sec-external-link-rel). These assert the seam registry
 * (`mdxComponents`) directly - the neutralizers and external-link hardening are
 * load-bearing and MUST survive any restyle/rewrite of the seam verbatim, never
 * softened to a class/style check nor delegated to the route.
 */
describe("mdx seam trust-boundary neutralizers", () => {
  it("script_element_renders_nothing_neutralizer_survives_rewrite", () => {
    const Script = mdxComponents.script as React.ElementType;
    const { container, unmount } = renderIntoDocument(
      createElement(Script, {}, "alert('should never render')")
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).not.toContain("alert(");
    expect(container.textContent).toBe("");

    unmount();
  });

  it("iframe_element_renders_nothing", () => {
    const Iframe = mdxComponents.iframe as React.ElementType;
    const { container, unmount } = renderIntoDocument(
      createElement(Iframe, { src: "https://evil.example/frame" })
    );

    expect(container.querySelector("iframe")).toBeNull();
    expect(container.textContent).toBe("");

    unmount();
  });

  it("external_link_carries_noopener_noreferrer", () => {
    const Anchor = mdxComponents.a as React.ElementType;
    const { container, unmount } = renderIntoDocument(
      createElement(Anchor, { href: "https://example.com/owner-authored" }, "External link")
    );

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(anchor?.getAttribute("target")).toBe("_blank");

    unmount();
  });

  it("external_link_hardening_wins_over_caller_supplied_rel_target", () => {
    const Anchor = mdxComponents.a as React.ElementType;
    const { container, unmount } = renderIntoDocument(
      createElement(
        Anchor,
        { href: "https://example.com", rel: "", target: "_self" },
        "External link"
      )
    );

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(anchor?.getAttribute("target")).toBe("_blank");

    unmount();
  });

  it("blockquote_renders_with_token_bound_classes", () => {
    const Blockquote = mdxComponents.blockquote as React.ElementType;
    const { container, unmount } = renderIntoDocument(
      createElement(Blockquote, {}, "Owner-authored quote")
    );

    const blockquote = container.querySelector("blockquote");
    expect(blockquote?.className).toContain("text-muted-foreground");
    expect(blockquote?.className).toContain("border-l-4");
    expect(blockquote?.className).toContain("border-border");
    expect(blockquote?.textContent).toBe("Owner-authored quote");

    unmount();
  });

  it("internal_link_carries_no_rel_or_target", () => {
    const Anchor = mdxComponents.a as React.ElementType;

    for (const href of ["/projects", "#section-id"]) {
      const { container, unmount } = renderIntoDocument(
        createElement(Anchor, { href }, "Internal link")
      );

      const anchor = container.querySelector("a");
      expect(anchor?.getAttribute("rel")).toBeNull();
      expect(anchor?.getAttribute("target")).toBeNull();

      unmount();
    }
  });
});
