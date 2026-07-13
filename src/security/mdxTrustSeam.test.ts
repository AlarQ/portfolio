import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FR-11 / sec-mdx-seam-untouched integration guard for the bespoke
 * organisms + post-layout pack (task 006). The MDX trust seam — the single
 * slug-validation gate (`buildPostSet`) and the MDX hardening seam
 * (`mdxPresentation.tsx`) — MUST retain its hardening logic while this
 * pack's components are built (CLAUDE.md "MDX trust boundary", ADR-0001,
 * D-7). Given its own file so a seam regression fails loudly and
 * independently of any organism/molecule test.
 *
 * This checks the on-disk content directly for the required hardening
 * markers, rather than diffing against a git branch ref — a branch-diff
 * approach is fragile (breaks once the reference branch is deleted
 * post-merge, or in a shallow CI clone that lacks the ref).
 */

const REPO_ROOT = join(import.meta.dirname, "../..");

const SEAM_FILES: Array<{ path: string; markers: string[] }> = [
  {
    path: "src/data/postLoader.ts",
    // The `^[a-z0-9-]+$` gate now lives in the single shared `src/data/slug.ts`
    // constant (consumed identically by Projects) — postLoader.ts imports it
    // rather than declaring its own copy.
    markers: ["SLUG_PATTERN"],
  },
  {
    path: "src/data/slug.ts",
    markers: ["^[a-z0-9-]+$"],
  },
  {
    path: "src/utils/mdxPresentation.tsx",
    markers: ["noopener noreferrer", "script: NoScript", "iframe: NoIframe"],
  },
];

describe("MDX trust seam — hardening markers present (FR-11)", () => {
  for (const { path: relativePath, markers } of SEAM_FILES) {
    it(`${relativePath} retains its hardening markers`, () => {
      const onDisk = readFileSync(join(REPO_ROOT, relativePath), "utf8");
      for (const marker of markers) {
        expect(onDisk).toContain(marker);
      }
    });
  }
});
