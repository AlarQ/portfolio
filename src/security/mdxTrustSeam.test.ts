import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FR-11 / sec-mdx-seam-untouched integration guard for the bespoke
 * organisms + post-layout pack (task 006). The MDX trust seam — the single
 * slug-validation gate (`buildPostSet`) and the MDX hardening seam
 * (`mdxPresentation.tsx`) — MUST stay byte-unchanged while this pack's
 * components are built (CLAUDE.md "MDX trust boundary", ADR-0001, D-7).
 * Given its own file so a seam regression fails loudly and independently of
 * any organism/molecule test.
 */

const REPO_ROOT = join(import.meta.dirname, "../..");
const BASE_REF = "feat/design-system";

const SEAM_FILES = ["src/data/postLoader.ts", "src/utils/mdxPresentation.tsx"];

function mergeBase(): string {
  return execFileSync("git", ["merge-base", "HEAD", BASE_REF], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  }).trim();
}

function contentAtRef(ref: string, relativePath: string): string {
  return execFileSync("git", ["show", `${ref}:${relativePath}`], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
}

describe("MDX trust seam — byte-unchanged since branch point (FR-11)", () => {
  const base = mergeBase();

  for (const relativePath of SEAM_FILES) {
    it(`${relativePath} is byte-unchanged since ${BASE_REF}`, () => {
      const atBase = contentAtRef(base, relativePath);
      // Working tree (not HEAD) so this fails immediately on an uncommitted
      // edit too, not only after a commit.
      const onDisk = readFileSync(join(REPO_ROOT, relativePath), "utf8");
      expect(onDisk).toBe(atBase);
    });
  }
});
