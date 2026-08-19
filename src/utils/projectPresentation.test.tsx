import { afterEach, describe, expect, it, vi } from "vitest";
import type { Project } from "@/data/projects";
import type { MilestoneProgress } from "@/data/roadmap";
import {
  featureStatusPresentation,
  milestoneDividerPresentation,
  milestoneFigure,
  milestoneLegend,
  repoRolePresentation,
  resolveCapabilityMedia,
  resolveClipUrl,
  resolvePosterUrl,
  techPresentation,
} from "./projectPresentation";

function progress(overrides: Partial<MilestoneProgress> = {}): MilestoneProgress {
  const base = {
    milestoneName: "MVP",
    toward: [],
    beyond: [],
    shippedToward: 3,
    totalToward: 6,
    progress: 0.5,
  };
  const merged = { ...base, ...overrides };
  return {
    ...merged,
    percent: overrides.percent ?? Math.round(merged.progress * 100),
  };
}

describe("techPresentation / repoRolePresentation - unchanged existing seams", () => {
  it("resolves a TechKey to a BadgeCategory", () => {
    expect(techPresentation("rust")).toBe("orange");
  });

  it("resolves a RepoRole to a display label", () => {
    expect(repoRolePresentation("backend")).toBe("Backend");
  });
});

describe("featureStatusPresentation", () => {
  it.each([
    ["shipped", "success"],
    ["in-progress", "info"],
    ["planned", "muted"],
  ] as const)("resolves %s to %s", (status, tone) => {
    expect(featureStatusPresentation(status)).toBe(tone);
  });
});

describe("milestoneFigure - index card figure", () => {
  it("renders NN% to <Milestone> below 100%", () => {
    expect(milestoneFigure(progress({ progress: 0.5, milestoneName: "MVP" }))).toBe("50% to MVP");
  });

  it("index-100-state: renders a state word, not a percentage, at 100%", () => {
    expect(milestoneFigure(progress({ progress: 1, milestoneName: "Maturity" }))).toBe(
      "Maturity reached"
    );
  });
});

describe("milestoneLegend - detail meter legend", () => {
  it("progress-100-visible: still renders NN% to <Milestone> at 100%, never a state word", () => {
    expect(milestoneLegend(progress({ progress: 1, milestoneName: "Maturity" }))).toBe(
      "100% to Maturity"
    );
  });

  it("renders NN% to <Milestone> below 100%", () => {
    expect(milestoneLegend(progress({ progress: 0.5, milestoneName: "MVP" }))).toBe("50% to MVP");
  });
});

describe("milestoneDividerPresentation - RoadmapSection divider tone (finding 6)", () => {
  it("resolves to success once every toward Feature has shipped", () => {
    expect(milestoneDividerPresentation(progress({ shippedToward: 6, totalToward: 6 }))).toBe(
      "success"
    );
  });

  it("resolves to muted while toward Features remain unshipped", () => {
    expect(milestoneDividerPresentation(progress({ shippedToward: 3, totalToward: 6 }))).toBe(
      "muted"
    );
  });

  it("resolves to muted (never success) when there are no toward Features", () => {
    expect(milestoneDividerPresentation(progress({ shippedToward: 0, totalToward: 0 }))).toBe(
      "muted"
    );
  });
});

describe("resolveClipUrl / resolvePosterUrl - media-base-url-swap (FR-4)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves a clip URL under the default /media base", () => {
    vi.stubEnv("MEDIA_BASE_URL", "");
    const url = resolveClipUrl("bondsmith", {
      kind: "clip",
      clip: "demo.mp4",
      poster: "demo.webp",
      label: "Demo",
      description: "desc",
    });
    expect(url).toBe("/media/bondsmith/demo.mp4");
  });

  it("resolves a clip URL under a swapped MEDIA_BASE_URL, with no other change", () => {
    vi.stubEnv("MEDIA_BASE_URL", "https://example.blob.vercel-storage.com");
    const url = resolveClipUrl("bondsmith", {
      kind: "clip",
      clip: "demo.mp4",
      poster: "demo.webp",
      label: "Demo",
      description: "desc",
    });
    expect(url).toBe("https://example.blob.vercel-storage.com/bondsmith/demo.mp4");
  });

  it("resolves a poster/still URL always on-site, independent of MEDIA_BASE_URL", () => {
    vi.stubEnv("MEDIA_BASE_URL", "https://example.blob.vercel-storage.com");
    expect(resolvePosterUrl("bondsmith", "demo.webp")).toBe("/media/bondsmith/demo.webp");
  });
});

function project(overrides: Partial<Project> = {}): Project {
  return {
    title: "Bondsmith",
    slug: "bondsmith",
    tagline: "tagline",
    repos: [],
    relatedPosts: [],
    capabilities: [],
    roadmap: { milestoneName: "MVP", features: [] },
    ...overrides,
  };
}

describe("resolveCapabilityMedia", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("text-only-capability-row: omits media for a Capability without one", () => {
    const resolved = resolveCapabilityMedia(
      project({ capabilities: [{ text: "A text-only claim." }] })
    );

    expect(resolved).toEqual([{ text: "A text-only claim." }]);
  });

  it("resolves a clip Capability's filenames through resolveClipUrl/resolvePosterUrl", () => {
    vi.stubEnv("MEDIA_BASE_URL", "https://example.blob.vercel-storage.com");
    const resolved = resolveCapabilityMedia(
      project({
        capabilities: [
          {
            text: "Clip claim.",
            media: {
              kind: "clip",
              clip: "demo.mp4",
              poster: "demo.webp",
              label: "the demo",
              description: "A demo clip.",
            },
          },
        ],
      })
    );

    expect(resolved).toEqual([
      {
        text: "Clip claim.",
        media: {
          kind: "clip",
          clipSrc: "https://example.blob.vercel-storage.com/bondsmith/demo.mp4",
          posterSrc: "/media/bondsmith/demo.webp",
          label: "the demo",
          description: "A demo clip.",
        },
      },
    ]);
  });

  it("still-only-project: resolves a still Capability's filename to an on-site src + alt", () => {
    const resolved = resolveCapabilityMedia(
      project({
        capabilities: [
          {
            text: "Still claim.",
            media: { kind: "still", still: "diagram.webp", alt: "A diagram." },
          },
        ],
      })
    );

    expect(resolved).toEqual([
      {
        text: "Still claim.",
        media: { kind: "still", src: "/media/bondsmith/diagram.webp", alt: "A diagram." },
      },
    ]);
  });
});
