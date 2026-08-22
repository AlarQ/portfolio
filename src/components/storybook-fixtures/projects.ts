import type { Project } from "@/data/projects";

/**
 * Page-agnostic Project fixtures for phase 2/3 Storybook stories
 * (`ProjectCard`, `ProjectSummary`, `RoadmapSection`, `CapabilitiesSection`,
 * `ClipRow`, `Pages/ProjectDetail`, …). `.ts`, not `.tsx` - no JSX, so no
 * sibling story is required by `scripts/check-stories.mjs`.
 *
 * `posterSrc`/`clipSrc` are pre-resolved URLs (as the presentation seam would
 * produce them), not bare filenames - `clipSrc` deliberately points at a
 * `.mp4` that does not exist on disk so Storybook-driven e2e can assert "no
 * request until Play" without a real clip asset.
 */

export const posterSrc = "/media/fixtures/poster.webp";
export const clipSrc = "/media/fixtures/clip.mp4";

export const bondsmithFixture: Project = {
  title: "Bondsmith",
  slug: "bondsmith",
  tagline:
    "A spec-driven development workflow engine in Rust - phase contracts enforced in typed code.",
  repos: [{ role: "backend", techKeys: ["rust"] }],
  relatedPosts: [],
  capabilities: [
    {
      text: "A feature moves through a fixed Plan → Build → Verify → Ship chain, each phase a typed contract with postconditions the engine evaluates itself.",
      media: {
        kind: "clip",
        clip: "flow-chain.mp4",
        poster: "flow-chain.webp",
        label: "the Plan to Ship flow chain",
        description: "Walking through a feature moving from Plan to Ship in the flowctl CLI.",
      },
    },
    {
      text: "There is no assert-and-warn escape hatch: a failed postcondition is a hard block.",
      media: {
        kind: "clip",
        clip: "hard-block.mp4",
        poster: "hard-block.webp",
        label: "a blocked postcondition",
        description: "A failed postcondition halting the flow instead of warning past it.",
      },
    },
    {
      text: "bondsmith-core splits into domain, application, and infrastructure layers, so deterministic rules stay isolated from the systems that carry them out.",
      media: {
        kind: "still",
        still: "layering.webp",
        alt: "A diagram of bondsmith-core's domain, application, and infrastructure layers.",
      },
    },
    { text: "The flowctl CLI is a thin clap shell over bondsmith-core." },
  ],
  roadmap: {
    milestoneName: "MVP",
    features: [
      {
        name: "Fixed Plan → Build → Verify → Ship phase chain",
        status: "shipped",
        phase: "toward",
      },
      { name: "Typed postcondition contracts per phase", status: "shipped", phase: "toward" },
      { name: "flowctl CLI over bondsmith-core", status: "shipped", phase: "toward" },
      {
        name: "Domain/application/infrastructure layering",
        status: "in-progress",
        phase: "toward",
      },
      { name: "bondsmith-web read-only Dashboard", status: "in-progress", phase: "toward" },
      { name: "Findings and learn-from-reports flow step", status: "planned", phase: "toward" },
      { name: "Multi-repo flow coordination", status: "planned", phase: "beyond" },
      { name: "Shareable flow contract templates", status: "planned", phase: "beyond" },
    ],
  },
};

export const hyperionFixture: Project = {
  title: "Hyperion",
  slug: "hyperion",
  tagline:
    "A shared Rust/Axum backend monolith powering several product apps over one Postgres contract.",
  repos: [{ role: "backend", techKeys: ["rust", "tokio", "axum", "postgres"] }],
  relatedPosts: [],
  capabilities: [
    {
      text: "One Cargo workspace replaces per-service deploys - a single deployable per app, built from a shared base of auth, sessions, DB pool, email, and AI code.",
      media: {
        kind: "still",
        still: "workspace.webp",
        alt: "A diagram of one Cargo workspace with four frontends over four backends sharing Hyperion core crates.",
      },
    },
    {
      text: "Domain crate boundaries are enforced by the compiler, not by convention: a cyclic dependency fails the build outright.",
      media: {
        kind: "still",
        still: "boundaries.webp",
        alt: "A diagram of compiler-enforced crate dependency boundaries.",
      },
    },
  ],
  roadmap: {
    milestoneName: "Maturity",
    features: [
      {
        name: "Single Cargo workspace with one deployable per app",
        status: "shipped",
        phase: "toward",
      },
      { name: "Shared auth, session, and DB-pool base crates", status: "shipped", phase: "toward" },
      { name: "Compiler-enforced domain crate boundaries", status: "shipped", phase: "toward" },
      { name: "Deep-dive write-up of the monorepo migration", status: "planned", phase: "beyond" },
    ],
  },
};

export const emptyCapabilitiesFixture: Project = {
  ...bondsmithFixture,
  title: "Empty Capabilities Project",
  slug: "empty-capabilities-project",
  capabilities: [],
};

export const manyBeyondFixture: Project = {
  ...hyperionFixture,
  title: "Many Beyond Project",
  slug: "many-beyond-project",
  roadmap: {
    milestoneName: "Maturity",
    features: [
      { name: "Core shipped", status: "shipped", phase: "toward" },
      { name: "Extract user service", status: "planned", phase: "beyond" },
      { name: "Extract billing service", status: "planned", phase: "beyond" },
      { name: "Multi-region deploy", status: "planned", phase: "beyond" },
      { name: "Public API SDK", status: "planned", phase: "beyond" },
    ],
  },
};
