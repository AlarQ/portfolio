// Diff-coverage gate (see .husky/pre-push): the lines this branch adds/changes
// under src/ must be >= COVERAGE_MIN% covered by the Vitest unit suite. Legacy
// untested code is ignored — only branch-new coverable lines count. Reads the
// lcov report produced by `npm run test:coverage` and the git diff against the
// merge-base with origin/main. Non-zero exit aborts the push.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const COVERAGE_MIN = Number(process.env.COVERAGE_MIN ?? 80);
const LCOV_PATH = join(process.cwd(), "coverage", "lcov.info");

// ANSI colors, disabled when piped or NO_COLOR is set (https://no-color.org).
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const yellow = paint(33);
const green = paint(32);
const red = paint(31);

// Same exclusions as the coverage block in vitest.config.ts.
const isExcluded = (file) =>
  !file.startsWith("src/") ||
  !/\.(ts|tsx)$/.test(file) ||
  /\.test\.(ts|tsx)$/.test(file) ||
  file.endsWith(".stories.tsx") ||
  file.endsWith(".d.ts");

const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const tryGit = (args) => {
  try {
    return git(args);
  } catch {
    return null;
  }
};

/** merge-base with origin/main, falling back to local main. */
const resolveBase = () => {
  if (process.env.COVERAGE_BASE) return process.env.COVERAGE_BASE;
  return tryGit(["merge-base", "origin/main", "HEAD"]) ?? tryGit(["merge-base", "main", "HEAD"]);
};

/** Map of file -> Set(added line numbers) from `git diff --unified=0`. */
const addedLinesByFile = (base) => {
  const diff = git(["diff", "--unified=0", "--no-color", base, "--", "src"]);
  const byFile = new Map();
  let current = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ ")) {
      // "+++ b/src/foo.ts" or "+++ /dev/null" for deletions
      const path = line.slice(4).replace(/^b\//, "");
      current = path === "/dev/null" || isExcluded(path) ? null : path;
      if (current && !byFile.has(current)) byFile.set(current, new Set());
      continue;
    }
    if (!current) continue;
    // @@ -old,n +start,count @@
    const m = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (m) {
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      for (let i = 0; i < count; i++) byFile.get(current).add(start + i);
    }
  }
  return byFile;
};

/** Parse lcov -> Map(file -> Map(line -> hits)). Paths normalized repo-relative. */
const parseLcov = () => {
  const cwd = process.cwd();
  const byFile = new Map();
  let file = null;
  let lines = null;
  for (const raw of readFileSync(LCOV_PATH, "utf8").split("\n")) {
    if (raw.startsWith("SF:")) {
      let path = raw.slice(3).trim();
      if (path.startsWith(cwd)) path = path.slice(cwd.length + 1);
      path = path.replace(/\\/g, "/");
      file = path;
      lines = new Map();
      byFile.set(file, lines);
    } else if (raw.startsWith("DA:") && lines) {
      const [ln, hits] = raw.slice(3).split(",");
      lines.set(Number(ln), Number(hits));
    } else if (raw === "end_of_record") {
      file = null;
      lines = null;
    }
  }
  return byFile;
};

const main = () => {
  const base = resolveBase();
  if (!base) {
    console.error(
      "[check-diff-coverage] Could not resolve a base ref (origin/main or main). " +
        "Fetch the base branch or set COVERAGE_BASE."
    );
    process.exit(1);
  }

  const added = addedLinesByFile(base);
  if (added.size === 0) {
    console.log(`check:diff-coverage — no new src/ lines vs ${base}; nothing to gate.`);
    return;
  }

  if (!existsSync(LCOV_PATH)) {
    console.error(
      `[check-diff-coverage] ${LCOV_PATH} missing — run \`npm run test:coverage\` first.`
    );
    process.exit(1);
  }
  const lcov = parseLcov();

  let total = 0;
  let covered = 0;
  // file -> { total, covered, uncovered: number[] } for the per-file breakdown
  const stats = new Map();

  for (const [file, addedSet] of added) {
    const lineHits = lcov.get(file); // may be undefined if absent from report
    for (const ln of addedSet) {
      const hits = lineHits?.get(ln);
      if (hits === undefined) continue; // non-coverable line (comment/type/blank)
      total += 1;
      if (!stats.has(file)) stats.set(file, { total: 0, covered: 0, uncovered: [] });
      const s = stats.get(file);
      s.total += 1;
      if (hits > 0) {
        covered += 1;
        s.covered += 1;
      } else {
        s.uncovered.push(ln);
      }
    }
  }

  if (total === 0) {
    console.log(`check:diff-coverage — no new coverable lines vs ${base}; pass.`);
    return;
  }

  const pct = (covered / total) * 100;
  const summary = `${covered}/${total} new coverable lines (${pct.toFixed(1)}%), floor ${COVERAGE_MIN}%`;

  // Per-file breakdown (least-covered first), always printed so the headline
  // percentage is auditable. Uncovered line numbers are listed inline.
  const out = pct < COVERAGE_MIN ? console.error : console.log;
  out(`check:diff-coverage — new code vs ${base}:`);
  const rows = [...stats.entries()].sort(
    (a, b) => a[1].covered / a[1].total - b[1].covered / b[1].total
  );
  for (const [file, s] of rows) {
    const fpct = ((s.covered / s.total) * 100).toFixed(0);
    const miss =
      s.uncovered.length > 0
        ? yellow(`  uncovered: ${s.uncovered.sort((a, b) => a - b).join(", ")}`)
        : "";
    // Fully-covered files read green; anything with a gap reads yellow.
    const tint = s.uncovered.length > 0 ? yellow : green;
    out(`  ${tint(`${s.covered}/${s.total} (${fpct}%)`)}  ${file}${miss}`);
  }

  if (pct < COVERAGE_MIN) {
    console.error(`\n${red(`check:diff-coverage — FAIL: ${summary}`)}`);
    console.error("Add unit tests exercising the new code, or reduce untested surface.");
    process.exit(1);
  }

  console.log(`\n${green(`check:diff-coverage — pass: ${summary}`)}`);
};

main();
