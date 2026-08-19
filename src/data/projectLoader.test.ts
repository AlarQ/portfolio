import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyProjectAuthoringRules,
  buildProjectSet,
  filterProjectsWithBrief,
  isAnimatedWebpHeader,
} from "./projectLoader";
import type { Capability, Project } from "./projects";

/**
 * Unit tests for the pure core `buildProjectSet(candidates): Project[]`.
 *
 * `projects.ts`'s owner-curated array is authored directly in code (no MDX
 * frontmatter, no filesystem read) so the "raw input" here is simply a
 * candidate `Project[]` - the pure core's job is to validate every slug
 * against the blog-identical `^[a-z0-9-]+$` gate before the set is trusted
 * downstream (FR-2, mirrors `buildPostSet`).
 */

function project(overrides: Partial<Project>): Project {
  return {
    title: "Sample Project",
    slug: "sample-project",
    tagline: "A sample project.",
    repos: [{ role: "backend", techKeys: ["typescript"] }],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [{ name: "A feature", status: "shipped", phase: "toward" }],
    },
    ...overrides,
  };
}

const noopDeps = { mediaExists: () => true, readMediaHeader: () => null };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildProjectSet - valid slug", () => {
  it("keeps a Project whose slug matches ^[a-z0-9-]+$", () => {
    // Given a single candidate with a valid slug
    const candidates: Project[] = [project({ slug: "portfolio-site" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then the Project is kept, unaltered
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("portfolio-site");
  });
});

describe("buildProjectSet - invalid slug", () => {
  it("skips a Project whose slug violates the pattern and warns naming it", () => {
    // Given a candidate slug containing characters outside [a-z0-9-]
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "Bad Slug!" }), project({ slug: "good-slug" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then only the valid entry survives, and a build warning names the bad slug
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("good-slug");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Bad Slug!"));
  });
});

describe("buildProjectSet - iteration order", () => {
  it("preserves input (declaration) order, never sorting or reordering", () => {
    // Given candidates in a deliberately non-alphabetical declaration order
    const candidates: Project[] = [
      project({ slug: "zebra-project", title: "Zebra" }),
      project({ slug: "alpha-project", title: "Alpha" }),
      project({ slug: "middle-project", title: "Middle" }),
    ];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then order equals declaration order - the first entry stays the
    // default-selected Project, not a sorted-first one
    expect(result.map((p) => p.slug)).toEqual(["zebra-project", "alpha-project", "middle-project"]);
  });
});

describe("buildProjectSet - path traversal slug", () => {
  it("skips a traversal slug via the regex gate alone, never touching the filesystem", () => {
    // Given a candidate slug carrying a traversal segment
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "../../etc/passwd" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then it is rejected by the same regex gate as any other invalid slug -
    // the pure core has no fs import, so it cannot have joined this to a path
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("../../etc/passwd"));
  });
});

/**
 * `filterProjectsWithBrief` - the missing-brief-warning gate (FR-9). Takes an
 * injected `briefExists` predicate so it's testable without touching the real
 * `content/projects/` filesystem (the real check, `hasBrief`, is a thin
 * `existsSync` wrapper exercised end-to-end by the Brief route's e2e suite).
 */
describe("filterProjectsWithBrief", () => {
  it("keeps a Project whose Brief exists, without warning", () => {
    // Given a single validated Project with a matching Brief
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "has-brief" })];

    // When filtering by an injected briefExists predicate that says "yes"
    const result = filterProjectsWithBrief(candidates, () => true);

    // Then the Project is kept and no warning fires
    expect(result).toEqual(candidates);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("drops a Project with no matching Brief and warns naming its slug", () => {
    // Given a validated Project with no matching Brief
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "no-brief" })];

    // When filtering by an injected briefExists predicate that says "no"
    const result = filterProjectsWithBrief(candidates, () => false);

    // Then the Project is excluded and a build warning names the slug
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("no-brief"));
  });

  it("preserves order across a mixed set, warning only for the missing one", () => {
    // Given two validated Projects, only the second of which has a Brief
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [
      project({ slug: "missing-brief" }),
      project({ slug: "present-brief" }),
    ];
    const briefExists = (slug: string) => slug === "present-brief";

    // When filtering
    const result = filterProjectsWithBrief(candidates, briefExists);

    // Then only the Project with a Brief survives, in original order
    expect(result.map((p) => p.slug)).toEqual(["present-brief"]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("missing-brief"));
  });
});

/**
 * `applyProjectAuthoringRules` - the FR-5 build-time Capability-media/Roadmap
 * checks. Every dependency is injected so tests never touch the real
 * filesystem.
 */
describe("applyProjectAuthoringRules - clip-cap-warning", () => {
  it("warns and still publishes a Project with more than 5 clips", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const clipCapability = (n: number): Capability => ({
      text: `clip ${n}`,
      media: {
        kind: "clip",
        clip: `clip-${n}.mp4`,
        poster: `poster-${n}.webp`,
        label: `Clip ${n}`,
        description: `Description ${n}`,
      },
    });
    const candidates = [
      project({ capabilities: Array.from({ length: 6 }, (_, i) => clipCapability(i)) }),
    ];

    const result = applyProjectAuthoringRules(candidates, noopDeps);

    expect(result).toHaveLength(1);
    expect(result[0]?.capabilities).toHaveLength(6);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("exceeds the 5-clip budget"));
  });
});

describe("applyProjectAuthoringRules - media-filename-rejected", () => {
  it("warns and strips a clip filename containing a traversal segment, never joining it to a path", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const mediaExists = vi.fn(() => true);
    const candidates = [
      project({
        capabilities: [
          {
            text: "text",
            media: {
              kind: "clip",
              clip: "../x.mp4",
              poster: "poster.webp",
              label: "Clip",
              description: "desc",
            },
          },
        ],
      }),
    ];

    const result = applyProjectAuthoringRules(candidates, { ...noopDeps, mediaExists });

    expect(result[0]?.capabilities[0]).toEqual({ text: "text" });
    expect(mediaExists).not.toHaveBeenCalledWith(expect.anything(), "../x.mp4");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('rejecting clip filename "../x.mp4"')
    );
  });
});

describe("applyProjectAuthoringRules - gif-rejected", () => {
  it("warns and strips a still authored as a .gif", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        capabilities: [{ text: "text", media: { kind: "still", still: "a.gif", alt: "An alt" } }],
      }),
    ];

    const result = applyProjectAuthoringRules(candidates, noopDeps);

    expect(result[0]?.capabilities[0]).toEqual({ text: "text" });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('rejecting still filename "a.gif"')
    );
  });
});

describe("applyProjectAuthoringRules - missing-poster-warns-not-drops", () => {
  it("warns and keeps the Capability when a poster is missing on disk", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        capabilities: [
          {
            text: "text",
            media: {
              kind: "clip",
              clip: "clip.mp4",
              poster: "poster.webp",
              label: "Clip",
              description: "desc",
            },
          },
        ],
      }),
    ];

    const result = applyProjectAuthoringRules(candidates, {
      ...noopDeps,
      mediaExists: () => false,
    });

    expect(result[0]?.capabilities[0]?.media).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('poster "poster.webp" not found'));
  });
});

describe("applyProjectAuthoringRules - empty-beyond-warning", () => {
  it("warns when a Roadmap has no beyond Features", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        roadmap: {
          milestoneName: "MVP",
          features: [{ name: "a", status: "shipped", phase: "toward" }],
        },
      }),
    ];

    applyProjectAuthoringRules(candidates, noopDeps);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no "beyond" Features'));
  });
});

describe("applyProjectAuthoringRules - missing-description-warning", () => {
  it("warns when a clip has an empty description", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        capabilities: [
          {
            text: "text",
            media: {
              kind: "clip",
              clip: "clip.mp4",
              poster: "poster.webp",
              label: "Clip",
              description: "  ",
            },
          },
        ],
      }),
    ];

    applyProjectAuthoringRules(candidates, noopDeps);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("empty description"));
  });
});

describe("applyProjectAuthoringRules - alt-empty-string-allowed", () => {
  it("does not warn about a still whose alt is exactly the empty string", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        capabilities: [{ text: "text", media: { kind: "still", still: "a.webp", alt: "" } }],
      }),
    ];

    const result = applyProjectAuthoringRules(candidates, noopDeps);

    expect(result[0]?.capabilities[0]?.media).toEqual({ kind: "still", still: "a.webp", alt: "" });
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("whitespace-only alt"));
  });

  it("warns about a still whose alt is whitespace-only", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates = [
      project({
        capabilities: [{ text: "text", media: { kind: "still", still: "a.webp", alt: "   " } }],
      }),
    ];

    applyProjectAuthoringRules(candidates, noopDeps);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("whitespace-only alt"));
  });
});

describe("applyProjectAuthoringRules - animated-webp", () => {
  it("warns when the poster header decodes as an animated WebP", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const animatedHeader = new TextEncoder().encode("RIFF....WEBPVP8X\0\0\0\0\0\0\0\0\0ANIM");
    const candidates = [
      project({
        capabilities: [
          {
            text: "text",
            media: {
              kind: "clip",
              clip: "clip.mp4",
              poster: "poster.webp",
              label: "Clip",
              description: "desc",
            },
          },
        ],
      }),
    ];

    applyProjectAuthoringRules(candidates, { ...noopDeps, readMediaHeader: () => animatedHeader });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("is an animated WebP"));
  });
});

describe("isAnimatedWebpHeader", () => {
  it("returns false for a header too short to inspect", () => {
    expect(isAnimatedWebpHeader(new Uint8Array(4))).toBe(false);
  });

  it("returns false for a static (non-animated) WebP header", () => {
    const header = new TextEncoder().encode("RIFF....WEBPVP8 ....................");
    expect(isAnimatedWebpHeader(header)).toBe(false);
  });

  it("returns true when the VP8X animation flag bit is set", () => {
    const bytes = new Uint8Array(32);
    bytes.set(new TextEncoder().encode("RIFF"), 0);
    bytes.set(new TextEncoder().encode("WEBP"), 8);
    bytes.set(new TextEncoder().encode("VP8X"), 12);
    bytes[20] = 0x02;
    expect(isAnimatedWebpHeader(bytes)).toBe(true);
  });

  it("returns true when an ANIM chunk tag appears in the header bytes", () => {
    const header = new TextEncoder().encode("RIFF....WEBPVP8XZZZZZZZZZZANIM");
    expect(isAnimatedWebpHeader(header)).toBe(true);
  });
});
