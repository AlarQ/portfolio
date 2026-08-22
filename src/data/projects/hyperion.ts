import type { Project } from "./index";

/**
 * Hyperion - the shared Rust/Axum backend monolith. Roadmap/Capability copy
 * drafted by the implementer from `content/projects/hyperion.mdx`'s Brief
 * body (decision 1, plan `eager-storm`) - owner to review. Milestone
 * "Maturity": every `toward` Feature already shipped, with Features scoped
 * `beyond` the current Milestone still open.
 */
export const hyperion: Project = {
  title: "Hyperion",
  slug: "hyperion",
  tagline:
    "A shared Rust/Axum backend monolith powering several product apps over one Postgres and OpenAPI contract.",
  repos: [{ role: "backend", techKeys: ["rust", "tokio", "axum", "postgres"] }],
  relatedPosts: [],
  capabilities: [
    {
      text: "One Cargo workspace replaces the old per-service deploys - a single deployable per app, each built from a shared base of auth, sessions, DB pool, email, and AI code written once instead of copied.",
    },
    {
      text: "Domain crate boundaries are enforced by the compiler, not by convention: a crate can only reach what it declares as a dependency, and Cargo rejects a dependency cycle outright, so an architecture-violating import fails the build.",
    },
    {
      text: "Domain crates stay decoupled from one another even inside the monorepo, so any of them could be pulled back out into its own service later if a real scaling need shows up.",
    },
    {
      text: "The crate and architecture docs render as one browsable, versioned book through the same diagram pipeline used on this site, so a crate rename breaks the doc build instead of quietly rotting in a wiki.",
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
      {
        name: "One OpenAPI contract shared across product apps",
        status: "shipped",
        phase: "toward",
      },
      {
        name: "Versioned, browsable crate and architecture docs",
        status: "shipped",
        phase: "toward",
      },
      { name: "Deep-dive write-up of the monorepo migration", status: "planned", phase: "beyond" },
      {
        name: "Extracting a domain crate back out as its own service",
        status: "planned",
        phase: "beyond",
      },
    ],
  },
};
