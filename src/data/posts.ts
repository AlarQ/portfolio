import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPostSet, type RawPostFile } from "./postLoader";

/**
 * A published blog Post's metadata.
 *
 * Authored fields (`title`, `dek`, `date`) come from MDX frontmatter; the rest
 * are derived by the loader. Carries NO JSX, color, or icons — presentation is
 * resolved at a separate seam (ADR-0001).
 */
export interface Post {
  readonly slug: string;
  readonly title: string;
  readonly dek: string;
  readonly date: string;
  readonly readingTimeMinutes: number;
  readonly formattedDate: string;
  readonly published: boolean;
}

const POSTS_DIR = join(process.cwd(), "content", "posts");

/**
 * The single public Post source. The thin impure rind: it only does disk IO
 * (readdir + read file) and hands raw files to the pure core `buildPostSet`,
 * which owns all validation, derivation, and ordering. Both the `/blog` index
 * and `/blog/[slug]` detail route consume this one source of truth.
 */
export function getPosts(): readonly Post[] {
  const rawFiles: RawPostFile[] = readdirSync(POSTS_DIR)
    .filter((filename) => filename.endsWith(".mdx"))
    .map((filename) => ({
      filename,
      content: readFileSync(join(POSTS_DIR, filename), "utf-8"),
    }));

  return buildPostSet(rawFiles);
}
