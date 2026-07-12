/**
 * PROTOTYPE — throwaway sample data. Not the real Project data model (that will
 * live in `src/data/` per the seam pattern). Enough shape to judge layout:
 * status, MVP Progress, tech stack, current state, "approaches" for the slider,
 * and related Posts. Delete with the rest of the prototype.
 */
import type { BadgeCategory } from "@/components/ui/badgeVariants";

export type ProjectStatus = "in-progress" | "shipped" | "exploring";

export interface TechChip {
  readonly label: string;
  readonly category: BadgeCategory;
}

/** One way of tackling the project — fodder for the "different approaches" slider. */
export interface Approach {
  readonly title: string;
  readonly summary: string;
  readonly tradeoff: string;
}

export interface RelatedPost {
  readonly label: string;
  readonly slug: string;
}

export interface PrototypeProject {
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly status: ProjectStatus;
  /** MVP Progress: how close to first usable release (0–100). */
  readonly mvpProgress: number;
  readonly currentState: string;
  readonly techStack: readonly TechChip[];
  readonly approaches: readonly Approach[];
  readonly relatedPosts: readonly RelatedPost[];
}

export const STATUS_META: Record<
  ProjectStatus,
  { readonly label: string; readonly category: BadgeCategory; readonly dot: string }
> = {
  "in-progress": { label: "In progress", category: "orange", dot: "bg-badge-orange-fg" },
  shipped: { label: "Shipped", category: "green", dot: "bg-badge-green-fg" },
  exploring: { label: "Exploring", category: "sky", dot: "bg-badge-sky-fg" },
};

export const prototypeProjects: readonly PrototypeProject[] = [
  {
    slug: "portfolio-blog",
    title: "Portfolio Blog Engine",
    tagline: "A CMS-free, MDX-rendered blog baked into a Next.js portfolio at build time.",
    status: "in-progress",
    mvpProgress: 72,
    currentState:
      "Blog index and single-post rendering are live in Storybook and wired to the `/` route. Currently hardening the MDX trust boundary and finishing the Projects surface (this prototype).",
    techStack: [
      { label: "Next.js 16", category: "gray-blue" },
      { label: "React 19", category: "sky" },
      { label: "MDX", category: "violet" },
      { label: "Tailwind", category: "indigo" },
      { label: "TypeScript", category: "sky" },
    ],
    approaches: [
      {
        title: "Static MDX at build time",
        summary: "Author Posts as MDX files, compile them during SSG. No runtime, no DB.",
        tradeoff: "Fastest + safest, but every edit needs a rebuild + deploy.",
      },
      {
        title: "Headless CMS",
        summary: "Pull Posts from Contentful/Sanity at build or request time.",
        tradeoff: "Nicer authoring UX, but adds an external dependency and a trust boundary.",
      },
      {
        title: "Git-backed markdown + ISR",
        summary: "Markdown in the repo, incrementally re-rendered on demand.",
        tradeoff: "Middle ground — freshness without a CMS, but more infra than pure SSG.",
      },
    ],
    relatedPosts: [
      { label: "Why MDX for the blog", slug: "why-mdx" },
      { label: "The seam pattern", slug: "seam-pattern" },
    ],
  },
  {
    slug: "design-tokens",
    title: "Two-Layer Design Tokens",
    tagline: "Primitive hex values feed semantic aliases, both verified at compile time.",
    status: "shipped",
    mvpProgress: 100,
    currentState:
      "In production across the whole surface. Aliases resolve to primitive names via `satisfies`, so an unbacked token is a compile error, and a freshness test guards the generated CSS.",
    techStack: [
      { label: "TypeScript", category: "sky" },
      { label: "Tailwind v4", category: "indigo" },
      { label: "shadcn/ui", category: "gray-blue" },
      { label: "Biome", category: "green" },
    ],
    approaches: [
      {
        title: "Compile-time satisfies check",
        summary: "Aliases must resolve to a known primitive name or TS fails the build.",
        tradeoff: "Zero runtime cost, but the invariant lives in the type system only.",
      },
      {
        title: "Runtime token validator",
        summary: "Validate the token graph at app startup instead.",
        tradeoff: "Catches dynamic tokens too, but ships checking code to users.",
      },
    ],
    relatedPosts: [{ label: "Tokens that can't drift", slug: "tokens-no-drift" }],
  },
  {
    slug: "route-migration",
    title: "Inverted IA Route Migration",
    tagline: "Moved the blog to `/` and 308-redirected the old paths without breaking feeds.",
    status: "shipped",
    mvpProgress: 100,
    currentState:
      "Merged (#78). The blog now lives at the site root; `/blog` permanently redirects, and the RSS feed's absolute URLs were repointed in the same slice.",
    techStack: [
      { label: "Next.js 16", category: "gray-blue" },
      { label: "Playwright", category: "orange" },
      { label: "RSS", category: "rose" },
    ],
    approaches: [
      {
        title: "308 permanent redirect",
        summary: "Server-level redirect from `/blog` → `/`, preserving link equity.",
        tradeoff: "Clean + cacheable, but locks in the new IA — hard to reverse later.",
      },
      {
        title: "Dual-mount both routes",
        summary: "Render the blog at both `/` and `/blog` with a canonical tag.",
        tradeoff: "Reversible, but two live URLs for one page invites SEO ambiguity.",
      },
    ],
    relatedPosts: [{ label: "Redirecting without breaking RSS", slug: "redirect-rss" }],
  },
  {
    slug: "agent-workflows",
    title: "Multi-Agent Review Harness",
    tagline: "Fan-out subagents that find, then adversarially verify, code-review findings.",
    status: "exploring",
    mvpProgress: 25,
    currentState:
      "Spike stage. Sketching a pipeline where review dimensions fan out in parallel and each finding is verified by independent skeptics before it survives.",
    techStack: [
      { label: "TypeScript", category: "sky" },
      { label: "Claude", category: "violet" },
      { label: "Node", category: "green" },
    ],
    approaches: [
      {
        title: "Pipeline per finding",
        summary: "Each finding flows find → verify independently, no barrier between stages.",
        tradeoff: "Best wall-clock, but harder to dedupe across the full set.",
      },
      {
        title: "Barrier then verify",
        summary: "Collect all findings, dedupe globally, then verify the survivors.",
        tradeoff: "Clean dedupe, but the fast finders idle waiting on the slow one.",
      },
      {
        title: "Loop-until-dry",
        summary: "Keep spawning finders until K rounds surface nothing new.",
        tradeoff: "Catches the long tail, but unbounded cost without a budget guard.",
      },
    ],
    relatedPosts: [{ label: "Adversarial verification", slug: "adversarial-verify" }],
  },
];
