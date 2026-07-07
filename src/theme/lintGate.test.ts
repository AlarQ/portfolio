import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * FR-3 (`no-direct-palette-import` GritQL rule, ADR-DS-6). Runs the real
 * `biome check` binary against a sandboxed copy of the plugin so these tests
 * exercise the actual mechanical lint gate, not a simulation of it.
 */
const repoRoot = process.cwd();
const biomeBin = join(repoRoot, "node_modules/.bin/biome");

let sandbox: string;

beforeEach(() => {
  sandbox = mkdtempSync(join(tmpdir(), "lint-gate-"));
  mkdirSync(join(sandbox, "grit"), { recursive: true });
  mkdirSync(join(sandbox, "src/theme"), { recursive: true });
  cpSync(
    join(repoRoot, "grit/no-direct-palette-import.grit"),
    join(sandbox, "grit/no-direct-palette-import.grit")
  );
  writeFileSync(
    join(sandbox, "biome.json"),
    JSON.stringify({
      $schema: "https://biomejs.dev/schemas/2.3.14/schema.json",
      plugins: ["./grit/no-direct-palette-import.grit"],
    })
  );
});

afterEach(() => {
  rmSync(sandbox, { recursive: true, force: true });
});

function runBiomeCheck(fixtureRelPath: string) {
  return spawnSync(biomeBin, ["check", fixtureRelPath], {
    cwd: sandbox,
    encoding: "utf-8",
  });
}

describe("no-direct-palette-import lint gate (FR-3)", () => {
  it("raw_hex_literal_in_component_fails_lint_and_names_file", () => {
    const fixture = "src/theme/BadHex.tsx";
    writeFileSync(
      join(sandbox, fixture),
      'export const Bad = () => <div style={{ color: "#ff0000" }} />;\n'
    );

    const result = runBiomeCheck(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(fixture);
    expect(result.stderr).toContain("Raw hex literal not allowed");
  });

  it("palette_primitive_import_in_component_fails_lint", () => {
    const fixture = "src/theme/BadImport.tsx";
    writeFileSync(
      join(sandbox, fixture),
      'import { primitives } from "../theme/tokens";\nexport const x = primitives.sky500;\n'
    );

    const result = runBiomeCheck(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(fixture);
    expect(result.stderr).toContain("Primitive-layer import");
  });

  it("import_of_unrelated_identifier_merely_containing_primitives_substring_passes_lint", () => {
    const fixture = "src/theme/GoodNamedButSimilar.tsx";
    writeFileSync(
      join(sandbox, fixture),
      'import { primitivesHelperUnrelated } from "../theme/tokens";\nexport const x = primitivesHelperUnrelated;\n'
    );

    const result = runBiomeCheck(fixture);

    expect(result.status).toBe(0);
  });

  it("namespace_import_of_tokens_fails_lint_even_without_static_primitives_text_in_import_line", () => {
    const fixture = "src/theme/BadNamespaceImport.tsx";
    writeFileSync(
      join(sandbox, fixture),
      'import * as tokens from "../theme/tokens";\nexport const x = tokens.primitives.sky500;\n'
    );

    const result = runBiomeCheck(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(fixture);
    expect(result.stderr).toContain("Namespace import");
  });

  it("component_using_only_semantic_aliases_passes_lint", () => {
    const fixture = "src/theme/Good.tsx";
    writeFileSync(
      join(sandbox, fixture),
      'import { semanticLight } from "../theme/tokens";\nexport const x = semanticLight.background;\n'
    );

    const result = runBiomeCheck(fixture);

    expect(result.status).toBe(0);
  });

  it("biome_version_pinned_not_caret_and_lockfile_committed", () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));

    expect(pkg.devDependencies["@biomejs/biome"]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(existsSync(join(repoRoot, "package-lock.json"))).toBe(true);
  });
});
