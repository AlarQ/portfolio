import { closeSync, existsSync, openSync, readSync } from "node:fs";
import { join } from "node:path";
import type { Capability, Project } from "./projects";
import { SLUG_PATTERN } from "./slug";

const CONTENT_PROJECTS_DIR = join(process.cwd(), "content", "projects");
const PUBLIC_MEDIA_DIR = join(process.cwd(), "public", "media");

/**
 * Pure core of the Project loader.
 *
 * Validates every candidate's slug against the blog-identical
 * `^[a-z0-9-]+$` gate (FR-2, `./slug`). `projects/index.ts`'s owner-curated
 * array is authored directly in code - there is no filesystem read or
 * frontmatter to parse for this metadata - so the "raw input" here is simply
 * the candidate `Project[]`. This is the single slug-validation gate for
 * Projects, mirroring `buildPostSet`: an invalid slug is skipped with a
 * build warning and never reaches a filesystem join (no `fs` import used for
 * this check). Filtering preserves input order - the caller's declaration
 * order is the authoritative iteration order (first entry is the
 * default-selected Project).
 */
export function buildProjectSet(candidates: readonly Project[]): Project[] {
  return candidates.filter(isSlugValid);
}

function isSlugValid(project: Project): boolean {
  if (SLUG_PATTERN.test(project.slug)) return true;
  console.warn(
    `[projects] skipping project with invalid slug "${project.slug}": must match ${SLUG_PATTERN}`
  );
  return false;
}

/**
 * Checks whether an already-validated Project slug has a matching Brief body
 * under `content/projects/`. This is an EXISTENCE check for a single,
 * already-known candidate - never a directory scan (no `readdirSync`) - so it
 * cannot introduce a new slug into the route set; the enumerate-not-glob
 * authority stays solely with `buildProjectSet`/`projects/index.ts` (FR-8/FR-9).
 */
export function hasBrief(slug: string): boolean {
  return existsSync(join(CONTENT_PROJECTS_DIR, `${slug}.mdx`));
}

/**
 * Filters an already-validated Project[] (`buildProjectSet` output) down to
 * those with a Brief body, warning once per Project skipped (FR-9,
 * missing-brief-warning) - mirrors the build-warning style of `isSlugValid`
 * above / `postLoader.ts`'s `isSlugValid`. `briefExists` defaults to the real
 * filesystem check (`hasBrief`) but is injectable so this stays testable
 * without touching disk.
 */
export function filterProjectsWithBrief(
  validatedProjects: readonly Project[],
  briefExists: (slug: string) => boolean = hasBrief
): Project[] {
  return validatedProjects.filter((project) => {
    if (briefExists(project.slug)) return true;
    console.warn(`[projects] no Brief found for "${project.slug}" - skipping its inline Brief`);
    return false;
  });
}

// --- FR-5: Capability media authoring rules --------------------------------

const MAX_CLIPS_PER_PROJECT = 5;

/** Bare-filename gate per media kind - `.gif` and any traversal segment both
 *  fail (no `.` or `/` in the allow-listed character class). */
export const MEDIA_FILENAME_PATTERN = {
  clip: /^[a-z0-9-]+\.(mp4|webm)$/,
  poster: /^[a-z0-9-]+\.webp$/,
  still: /^[a-z0-9-]+\.webp$/,
} as const;

/** Injectable side effects for `applyProjectAuthoringRules`, so its tests
 *  never touch the real filesystem. */
export interface ProjectAuthoringDeps {
  readonly mediaExists: (slug: string, filename: string) => boolean;
  readonly readMediaHeader: (slug: string, filename: string) => Uint8Array | null;
}

function realMediaExists(slug: string, filename: string): boolean {
  return existsSync(join(PUBLIC_MEDIA_DIR, slug, filename));
}

/** Reads only the first 64 header bytes off disk (`open`+`read`, never a
 *  full `readFileSync`) - `isAnimatedWebpHeader` never needs more, and a
 *  Capability's poster/still can be an arbitrarily large image. */
function realReadMediaHeader(slug: string, filename: string): Uint8Array | null {
  const path = join(PUBLIC_MEDIA_DIR, slug, filename);
  let fd: number | undefined;
  try {
    fd = openSync(path, "r");
    const buffer = Buffer.alloc(64);
    const bytesRead = readSync(fd, buffer, 0, 64, 0);
    return new Uint8Array(buffer.subarray(0, bytesRead));
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

const realProjectAuthoringDeps: ProjectAuthoringDeps = {
  mediaExists: realMediaExists,
  readMediaHeader: realReadMediaHeader,
};

/**
 * Detects an animated WebP from its first 64 header bytes only (no full
 * decode). Animated if bytes 0-3 are `RIFF`, bytes 8-11 are `WEBP`, and
 * either the chunk at 12-15 is `VP8X` with the animation flag bit (0x02) set
 * on the flags byte at offset 20, or the ASCII `ANIM` chunk tag appears
 * anywhere within the sampled header bytes.
 */
export function isAnimatedWebpHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 21) return false;
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length));

  if (ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") return false;

  if (ascii(12, 4) === "VP8X") {
    const flags = bytes[20] ?? 0;
    if ((flags & 0x02) !== 0) return true;
  }

  const headerAscii = ascii(0, bytes.length);
  return headerAscii.includes("ANIM");
}

function warn(message: string): void {
  console.warn(`[projects] ${message}`);
}

function isValidMediaFilename(kind: "clip" | "poster" | "still", filename: string): boolean {
  return MEDIA_FILENAME_PATTERN[kind].test(filename);
}

/**
 * Validates one Capability's media against the FR-5 filename/existence/
 * animation/metadata rules, returning a possibly-`media`-stripped Capability
 * (decision 4: an invalid filename strips the offending `media` item -
 * Capability becomes text-only - rather than dropping the whole Project).
 * `clipCount`/`slug` are passed in only for warning context; the >5-clips
 * check itself is applied by the caller across the whole Project.
 */
function validateCapability(
  slug: string,
  capability: Capability,
  deps: ProjectAuthoringDeps
): Capability {
  const media = capability.media;
  if (!media) return capability;

  if (media.kind === "clip") {
    if (!isValidMediaFilename("clip", media.clip)) {
      warn(
        `project "${slug}": rejecting clip filename "${media.clip}" (must match ${MEDIA_FILENAME_PATTERN.clip})`
      );
      return { text: capability.text };
    }
    if (!isValidMediaFilename("poster", media.poster)) {
      warn(
        `project "${slug}": rejecting poster filename "${media.poster}" (must match ${MEDIA_FILENAME_PATTERN.poster})`
      );
      return { text: capability.text };
    }
    if (!deps.mediaExists(slug, media.poster)) {
      warn(`project "${slug}": poster "${media.poster}" not found under public/media/${slug}/`);
    }
    if (!media.description.trim()) {
      warn(`project "${slug}": clip "${media.clip}" has an empty description`);
    }
    const header = deps.readMediaHeader(slug, media.poster);
    if (header && isAnimatedWebpHeader(header)) {
      warn(
        `project "${slug}": poster "${media.poster}" is an animated WebP - stills/posters must be static`
      );
    }
    return capability;
  }

  // still
  if (!isValidMediaFilename("still", media.still)) {
    warn(
      `project "${slug}": rejecting still filename "${media.still}" (must match ${MEDIA_FILENAME_PATTERN.still})`
    );
    return { text: capability.text };
  }
  if (!deps.mediaExists(slug, media.still)) {
    warn(`project "${slug}": still "${media.still}" not found under public/media/${slug}/`);
  }
  // A non-empty, whitespace-only alt is almost certainly an authoring
  // mistake; an explicit `alt: ""` is a valid, intentional decorative-image
  // opt-out and must not warn.
  if (media.alt !== "" && media.alt.trim() === "") {
    warn(
      `project "${slug}": still "${media.still}" has a whitespace-only alt (use "" explicitly if intentional)`
    );
  }
  const header = deps.readMediaHeader(slug, media.still);
  if (header && isAnimatedWebpHeader(header)) {
    warn(
      `project "${slug}": still "${media.still}" is an animated WebP - stills/posters must be static`
    );
  }
  return capability;
}

/**
 * Applies the FR-5 build-time Capability-media/Roadmap authoring rules to an
 * already-validated, Brief-having Project set: warn-and-continue for every
 * check except an invalid media filename, which strips that `media` item
 * (Capability becomes text-only, Project kept - decision 4) so an invalid
 * name can never reach the presentation seam's URL join.
 */
export function applyProjectAuthoringRules(
  projects: readonly Project[],
  deps: ProjectAuthoringDeps = realProjectAuthoringDeps
): Project[] {
  return projects.map((project) => {
    const clipCount = project.capabilities.filter((c) => c.media?.kind === "clip").length;
    if (clipCount > MAX_CLIPS_PER_PROJECT) {
      warn(
        `project "${project.slug}": ${clipCount} clips exceeds the ${MAX_CLIPS_PER_PROJECT}-clip budget`
      );
    }

    const beyondCount = project.roadmap.features.filter((f) => f.phase === "beyond").length;
    if (beyondCount === 0) {
      warn(`project "${project.slug}": Roadmap has no "beyond" Features`);
    }

    const capabilities = project.capabilities.map((capability) =>
      validateCapability(project.slug, capability, deps)
    );

    return { ...project, capabilities };
  });
}
