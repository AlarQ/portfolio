import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { StatusTone } from "@/components/ui/statusDotVariants";
import { getMediaBaseUrl } from "@/data/mediaConfig";
import type {
  Capability,
  CapabilityMedia,
  FeatureStatus,
  Project,
  RepoRole,
  TechKey,
} from "@/data/projects";
import type { MilestoneProgress } from "@/data/roadmap";

/**
 * Closed `TechKey → BadgeCategory` map - the tech-stack analogue of
 * `CATEGORY_HUES`. Exhaustive `Record<TechKey, …>`: a `TechKey` added to
 * `data/projects.ts` without a matching hue here is a compile error.
 */
const TECH_HUES: Record<TechKey, BadgeCategory> = {
  nextjs: "gray-blue",
  react: "sky",
  typescript: "indigo",
  tailwind: "green",
  mdx: "violet",
  shadcn: "pink",
  biome: "orange",
  playwright: "rose",
  rss: "orange",
  node: "green",
  claude: "violet",
  rust: "orange",
  tokio: "sky",
  axum: "rose",
  postgres: "indigo",
};

/** Resolve a Project `TechKey` to its Badge hue. */
export function techPresentation(key: TechKey): BadgeCategory {
  return TECH_HUES[key];
}

/** Closed RepoRole → display label map - the role analogue of TECH_HUES.
 *  Exhaustive: a RepoRole without a label here is a compile error. */
const REPO_ROLE_LABELS: Record<RepoRole, string> = {
  frontend: "Frontend",
  backend: "Backend",
};

/** Resolve a ProjectRepo `RepoRole` to its display label. */
export function repoRolePresentation(role: RepoRole): string {
  return REPO_ROLE_LABELS[role];
}

/** Closed `FeatureStatus → StatusTone` map (status-tone-exhaustive) - a
 *  `FeatureStatus` member added without a matching entry here is a compile
 *  error, not a runtime gap. */
export const FEATURE_STATUS_TONES: Record<FeatureStatus, StatusTone> = {
  shipped: "success",
  "in-progress": "info",
  planned: "muted",
};

/** Resolve a Roadmap Feature's `FeatureStatus` to its `StatusDot` tone. */
export function featureStatusPresentation(status: FeatureStatus): StatusTone {
  return FEATURE_STATUS_TONES[status];
}

/** Closed `FeatureStatus → display word` map - used only in the row's
 *  accessible name (roadmap-status-accessible-name), never shown visibly. */
export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  planned: "Planned",
};

/**
 * Resolve a Capability clip's bare filename to its playable URL, under the
 * configured media base (FR-4, media-base-url-swap) - the only place a clip
 * `src` is assembled.
 */
export function resolveClipUrl(
  slug: string,
  media: Extract<CapabilityMedia, { kind: "clip" }>
): string {
  return `${getMediaBaseUrl()}/${slug}/${media.clip}`;
}

/**
 * Resolve a poster/still bare filename to its `next/image` `src`. Posters and
 * stills are always served on-site (`public/media/<slug>/`), never off the
 * configurable `mediaBaseUrl` - only clips move to remote storage.
 */
export function resolvePosterUrl(slug: string, filename: string): string {
  return `/media/${slug}/${filename}`;
}

/**
 * The index card's light inline Milestone Progress figure (FR-7): `"NN% to
 * <Milestone>"`, or at 100% a state word `"<Milestone> reached"` (works
 * identically for "MVP" and "Maturity" - decision 5).
 */
export function milestoneFigure(progress: MilestoneProgress): string {
  const { percent } = progress;
  if (percent >= 100) return `${progress.milestoneName} reached`;
  return `${percent}% to ${progress.milestoneName}`;
}

/**
 * The detail header meter's legend: always `"NN% to <Milestone>"`, even at
 * 100% (progress-100-visible) - unlike `milestoneFigure`, the meter never
 * swaps to a state word.
 */
export function milestoneLegend(progress: MilestoneProgress): string {
  return `${progress.percent}% to ${progress.milestoneName}`;
}

/**
 * Resolve a Roadmap's Milestone Progress to the `RoadmapSection` divider's
 * `StatusDot` tone (finding 6): `"success"` once every `toward` Feature has
 * shipped, `"muted"` otherwise. Keeps the divider's success color bound
 * through the same closed `StatusTone` seam `FEATURE_STATUS_TONES` uses,
 * rather than a hardcoded `border-badge-green-fg`/`text-badge-green-fg`
 * literal in the component.
 */
export function milestoneDividerPresentation(progress: MilestoneProgress): StatusTone {
  const isComplete = progress.totalToward > 0 && progress.shippedToward === progress.totalToward;
  return isComplete ? "success" : "muted";
}

/** A Capability with its `media` (if any) resolved to on-site/`mediaBaseUrl`
 *  URLs by this seam - the shape `ds/CapabilitiesSection` and `ds/ClipRow`
 *  consume, never a bare filename or `Capability` directly. */
export interface ResolvedCapability {
  readonly text: string;
  readonly media?:
    | {
        readonly kind: "clip";
        readonly clipSrc: string;
        readonly posterSrc: string;
        readonly label: string;
        readonly description: string;
      }
    | { readonly kind: "still"; readonly src: string; readonly alt: string };
}

/**
 * Resolve every Capability's media on a Project to on-site/`mediaBaseUrl`
 * URLs (FR-4) via `resolveClipUrl`/`resolvePosterUrl` - the single place a
 * `Capability`'s bare filenames become URLs. Capabilities without media pass
 * through with `media` omitted (text-only-capability-row).
 */
export function resolveCapabilityMedia(project: Project): readonly ResolvedCapability[] {
  return project.capabilities.map((capability) => resolveOneCapability(project.slug, capability));
}

function resolveOneCapability(slug: string, capability: Capability): ResolvedCapability {
  const { media } = capability;
  if (!media) return { text: capability.text };

  if (media.kind === "clip") {
    return {
      text: capability.text,
      media: {
        kind: "clip",
        clipSrc: resolveClipUrl(slug, media),
        posterSrc: resolvePosterUrl(slug, media.poster),
        label: media.label,
        description: media.description,
      },
    };
  }

  return {
    text: capability.text,
    media: {
      kind: "still",
      src: resolvePosterUrl(slug, media.still),
      alt: media.alt,
    },
  };
}
