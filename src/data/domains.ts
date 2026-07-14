/**
 * A Skill's proficiency within a Domain Area — an ordinal, closed vocabulary.
 * The level → visual resolution (label + Badge hue) lives in the sibling
 * `src/utils/skillPresentation.tsx` seam via an exhaustive
 * `Record<SkillLevel, …>`; this module stays JSX/color/icon-free (seam
 * pattern, mirrors `src/data/projects.ts`). Adding a level here is a compile
 * error until the seam maps it.
 */
export type SkillLevel = "expert" | "proficient";

/**
 * A concrete, outcome-oriented thing the owner delivered within a Domain Area
 * — past tense, evidence. The Achievement view of an area (what was done),
 * paired with the Skill view (what the owner can do).
 */
export interface Achievement {
  readonly id: string;
  readonly description: string;
}

/**
 * A durable capability the owner holds within a Domain Area — present tense,
 * rated. Carries a `level` and optional `years` of experience.
 */
export interface Skill {
  readonly name: string;
  readonly level: SkillLevel;
  readonly years?: number;
}

/**
 * A field of expertise the owner works in. Evidenced by `achievements` and
 * rated by `skills` — two views of one area. `headline` is the area's offering
 * (rendered by `AreaHeadlineCard`).
 */
export interface DomainArea {
  readonly id: string;
  readonly name: string;
  readonly headline: string;
  readonly achievements: readonly Achievement[];
  readonly skills: readonly Skill[];
}

const leadership: DomainArea = {
  id: "leadership",
  name: "Leadership",
  headline: "I lead full-stack engineering teams to predictable, end-to-end delivery.",
  achievements: [
    {
      id: "led-teams",
      description:
        "Led full-stack engineering teams of up to eight for three-plus years, owning delivery end-to-end.",
    },
    {
      id: "cross-team-go-live",
      description:
        "Planned and shipped a three-month cross-team project spanning roughly a dozen engineers to a clean production go-live.",
    },
    {
      id: "retrospectives",
      description:
        "Introduced structured retrospectives and technical discussions that improved sprint predictability.",
    },
    {
      id: "people-growth",
      description:
        "Ran 1:1s, performance reviews, mentoring, hiring, and onboarding to grow the team.",
    },
  ],
  skills: [
    { name: "Team leadership", level: "expert", years: 3 },
    { name: "Delivery ownership", level: "expert" },
    { name: "Hiring & onboarding", level: "proficient" },
    { name: "Mentoring & 1:1s", level: "proficient" },
  ],
};

const backend: DomainArea = {
  id: "backend",
  name: "Backend engineering",
  headline: "I build low-latency, high-throughput backend services and distributed systems.",
  achievements: [
    {
      id: "backend-tenure",
      description:
        "Six-plus years building backend services in Rust and Scala across microservice architectures.",
    },
    {
      id: "rust-library",
      description:
        "Built a reusable Rust integration library that cut integration delivery time by around 30%.",
    },
    {
      id: "scala-to-rust",
      description: "Migrated production services from Scala into a Rust ecosystem.",
    },
    {
      id: "distributed-systems",
      description:
        "Designed and operated distributed systems on Kafka, Kubernetes, and Google Cloud Platform.",
    },
  ],
  skills: [
    { name: "Scala", level: "expert", years: 6 },
    { name: "Rust", level: "proficient", years: 3 },
    { name: "Microservices & distributed systems", level: "expert" },
    { name: "Kafka", level: "proficient" },
    { name: "Kubernetes", level: "proficient" },
    { name: "Google Cloud Platform", level: "proficient" },
    { name: "PostgreSQL", level: "proficient" },
    { name: "ScyllaDB", level: "proficient" },
    { name: "Elasticsearch", level: "proficient" },
  ],
};

export const domainAreas: readonly DomainArea[] = [leadership, backend];
