import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CategoryName } from "./categories";
import { buildPostSet, type RawPostFile } from "./postLoader";

/**
 * A published blog Post's metadata.
 *
 * Authored fields (`title`, `dek`, `date`) come from MDX frontmatter; the rest
 * are derived by the loader. Carries NO JSX, color, or icons - presentation is
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
  /** Optional site-relative cover image path (`/…` under `public/`), validated in the loader. */
  readonly coverImage?: string;
  /** Optional vocabulary categories, validated against `categories.ts` in the loader. */
  readonly categories?: readonly CategoryName[];
  /** Optional Hacker News discuss/share URL, validated in the loader. */
  readonly hnUrl?: string;
}

const POSTS_DIR = join(process.cwd(), "content", "posts");

/**
 * The single public Post source. The thin impure rind: it only does disk IO
 * (readdir + read file) and hands raw files to the pure core `buildPostSet`,
 * which owns all validation, derivation, and ordering. Both the `/blog` index
 * and `/blog/[slug]` detail route consume this one source of truth.
 */
export function getPosts(): readonly Post[] {
  let filenames: string[];
  try {
    filenames = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    console.error(`[posts] cannot read posts directory (${code ?? "unknown"})`);
    return [];
  }

  const rawFiles: RawPostFile[] = filenames.flatMap((filename) => {
    try {
      return [{ filename, content: readFileSync(join(POSTS_DIR, filename), "utf-8") }];
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      console.error(`[posts] skipping "${filename}": read failed (${code ?? "unknown"})`);
      return [];
    }
  });

  return buildPostSet(rawFiles);
}

/**
 * The one per-slug lookup over the Post set. The detail route's metadata and
 * page both ask for *a Post* through here instead of fetching *all Posts* and
 * filtering inline, so the `slug === slug` match lives in exactly one place.
 */
export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}
