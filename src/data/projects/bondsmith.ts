import type { Project } from "./index";

/**
 * Bondsmith - the spec-driven workflow engine. Roadmap/Capability copy
 * drafted by the implementer from `content/projects/bondsmith.mdx`'s Brief
 * body (decision 1, plan `eager-storm`) - owner to review. Milestone "MVP":
 * 8 Features, 6 `toward` with 3 shipped, 2 `beyond`.
 */
export const bondsmith: Project = {
  title: "Bondsmith",
  slug: "bondsmith",
  tagline:
    "A spec-driven development workflow engine in Rust - phase contracts enforced in typed code, not by an LLM.",
  repos: [{ role: "backend", techKeys: ["rust"] }],
  relatedPosts: [],
  capabilities: [
    {
      text: "A feature moves through a fixed Plan → Build → Verify → Ship chain of phases, each one a typed contract with postconditions the engine evaluates itself, in Rust.",
    },
    {
      text: "There is no assert-and-warn escape hatch: a failed postcondition is a hard block, so no LLM grades its own homework mid-flow.",
    },
    {
      text: "`bondsmith-core` splits into three layers - domain (pure, zero-IO flow contracts and findings), application (a Driver evaluated against six IO ports), and infrastructure (git, gate runner, state store, worker launchers, clock) - so the deterministic rules stay isolated from the systems that carry them out.",
    },
    {
      text: "The `flowctl` CLI is a thin clap shell over `bondsmith-core`; a read-only Dioxus desktop Dashboard, `bondsmith-web`, is still in progress on top of the same core.",
    },
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
        name: "Domain/application/infrastructure layering in bondsmith-core",
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
