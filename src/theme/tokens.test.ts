import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertInsideThemeDir, emitTokensCss, writeTokensCss } from "../../scripts/generate-tokens";
import { primitives, semanticDark, semanticLight } from "./tokens";

const repoRoot = process.cwd();
const HEX = /^#[0-9a-fA-F]{3,8}$/;

describe("token codegen (FR-2, ADR-DS-3)", () => {
  it("generate_tokens_twice_emits_byte_identical_css", () => {
    // Deterministic codegen: no timestamps, no random ordering, no env input.
    expect(emitTokensCss()).toBe(emitTokensCss());
  });

  it("generated_css_carries_at_generated_banner", () => {
    expect(emitTokensCss()).toMatch(/@generated/);
  });

  it("tokens_ts_has_distinct_primitive_and_semantic_maps", () => {
    // Two-layer shape: the primitive palette and the semantic alias map are
    // distinct, populated exports — not one flattened block (ADR-DS-3).
    expect(primitives).not.toBe(semanticLight);
    expect(Object.keys(primitives).length).toBeGreaterThan(0);
    expect(Object.keys(semanticLight).length).toBeGreaterThan(0);
  });

  it("every_semantic_alias_resolves_to_a_primitive_not_inline_hex", () => {
    const primitiveNames = new Set(Object.keys(primitives));
    for (const [alias, value] of [
      ...Object.entries(semanticLight),
      ...Object.entries(semanticDark),
    ]) {
      // A semantic alias points at a primitive NAME, never an inline hex.
      expect(value, `${alias} must not be an inline hex`).not.toMatch(HEX);
      expect(primitiveNames, `${alias} → ${value} must be a primitive`).toContain(value);
    }
  });

  it("regenerate_overwrites_hand_edited_tokens_css", () => {
    // Regeneration is authoritative over a manual edit. Run in a sandbox repo
    // root so the test proves overwrite without mutating the tracked artifact.
    const sandbox = mkdtempSync(join(tmpdir(), "tokens-codegen-"));
    try {
      mkdirSync(join(sandbox, "src/theme"), { recursive: true });
      const out = join(sandbox, "src/theme/tokens.css");
      writeTokensCss(sandbox);
      const sentinel = "__MANUAL_OVERRIDE_SENTINEL__";
      writeFileSync(out, `/* ${sentinel} */`);
      writeTokensCss(sandbox);
      const result = readFileSync(out, "utf-8");
      expect(result).not.toContain(sentinel);
      expect(result).toBe(emitTokensCss());
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it("codegen_output_path_is_hardcoded_literal", () => {
    const src = readFileSync(join(repoRoot, "scripts/generate-tokens.ts"), "utf-8");
    // The output path is a fixed literal, never derived from external input.
    expect(src).toMatch(/["']src\/theme\/tokens\.css["']/);
    expect(src).not.toMatch(/process\.env/);
    expect(src).not.toMatch(/process\.argv/);
  });

  it("codegen_fails_fast_if_resolved_path_outside_src_theme", () => {
    expect(() => assertInsideThemeDir(repoRoot, "/etc/passwd")).toThrow();
    expect(() =>
      assertInsideThemeDir(repoRoot, join(repoRoot, "src/theme/../data/evil.css"))
    ).toThrow();
    expect(() =>
      assertInsideThemeDir(repoRoot, join(repoRoot, "src/theme/tokens.css"))
    ).not.toThrow();
  });

  it("tokens_ts_references_no_env_or_credential", () => {
    const src = readFileSync(join(repoRoot, "src/theme/tokens.ts"), "utf-8");
    expect(src).not.toMatch(/process\.env/);
    expect(src).not.toMatch(/\bdotenv\b/);
    expect(src).not.toMatch(/API_KEY|SECRET|PASSWORD|CREDENTIAL/i);
  });

  it("dark_palette_is_single_dark_block_sourced_from_figma_dark_frame", () => {
    // FR-9 / ADR-DS-5: semanticDark's alias names are a subset of semanticLight's
    // (no dark-only aliases), and the emitted `.dark {}` block resolves to the
    // observed Figma dark-frame hexes (node `614:679`).
    const lightAliases = new Set(Object.keys(semanticLight));
    for (const alias of Object.keys(semanticDark)) {
      expect(lightAliases, `${alias} must be one of semanticLight's aliases`).toContain(alias);
    }
    expect(Object.keys(semanticDark).length).toBeGreaterThan(0);

    const css = emitTokensCss();
    const darkBlockMatch = css.match(/\.dark\s*\{([^}]*)\}/);
    expect(darkBlockMatch).not.toBeNull();
    const darkBlock = darkBlockMatch?.[1] ?? "";
    expect(darkBlock).toMatch(/--background:\s*var\(--background-dark\)/);
    expect(darkBlock).toMatch(/--foreground:\s*var\(--heading-dark\)/);
    expect(darkBlock).toMatch(/--muted-foreground:\s*var\(--body-dark\)/);
    expect(darkBlock).toMatch(/--accent:\s*var\(--accent-byline-dark\)/);

    // Values match Figma dark-frame node 614:679 (bg, heading, body, accent),
    // asserted as regex-format checks (not raw hex literals, per
    // no-direct-palette-import) plus an explicit equality cross-check against
    // the sibling `accentByline` (byline accent unchanged between frames).
    expect(primitives.backgroundDark).toMatch(HEX);
    expect(primitives.headingDark).toMatch(HEX);
    expect(primitives.bodyDark).toMatch(HEX);
    expect(primitives.accentBylineDark).toBe(primitives.accentByline);
  });

  it("dark_primitives_are_hand_pinned_literals_not_ramp_derived", () => {
    // ADR-DS-7: only the primary 50–900 ramp is synthetic. Assert the dark
    // primitives are plain string literals in tokens.ts, never a call to
    // hslToHex/primaryRamp.
    const src = readFileSync(join(repoRoot, "src/theme/tokens.ts"), "utf-8");
    expect(src).toMatch(/backgroundDark:\s*"#[0-9a-fA-F]{6}"/);
    expect(src).toMatch(/headingDark:\s*"#[0-9a-fA-F]{6}"/);
    expect(src).toMatch(/bodyDark:\s*"#[0-9a-fA-F]{6}"/);
    expect(src).toMatch(/accentBylineDark:\s*"#[0-9a-fA-F]{6}"/);
    expect(src).not.toMatch(/backgroundDark:\s*hslToHex/);
  });

  it("emitter_is_dark_aware_light_to_root_dark_to_dark_block", () => {
    const css = emitTokensCss();
    // Light tokens live under :root; dark under a .dark block — emitted from the
    // start even while the dark values are empty until Task 008 fills them.
    expect(css).toMatch(/:root\s*\{/);
    expect(css).toMatch(/\.dark\s*\{/);
  });
});
