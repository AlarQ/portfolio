import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Task 004 behavior 6: SOLE owner of the `Atoms/<ComponentName>` Storybook
 * sidebar convention for src/components/ui - no other task may re-assert it.
 */
const uiDir = join(process.cwd(), "src/components/ui");
const storyFiles = readdirSync(uiDir).filter((file) => file.endsWith(".stories.tsx"));

describe("every ui atom story is titled under Atoms/ (Task 004 behavior 6)", () => {
  it("finds at least one .stories.tsx file under src/components/ui", () => {
    expect(storyFiles.length).toBeGreaterThan(0);
  });

  it.each(storyFiles)("%s has a title starting with 'Atoms/'", (file: string) => {
    const source = readFileSync(join(uiDir, file), "utf-8");
    const match = source.match(/title:\s*["'](.+?)["']/);

    expect(match).not.toBeNull();
    expect(match?.[1]).toMatch(/^Atoms\//);
  });
});
