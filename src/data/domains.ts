import type { Achievement } from "./experience";
import { leadershipAchievements, technicalAchievements } from "./experience";
import type { IconKey, Skill } from "./skills";
import { leadershipSkills, technicalSkills } from "./skills";

// A Domain Area is a field of expertise (see CONTEXT.md): evidenced by
// Achievements and rated by Skills — two views of one area. This module is the
// single home for that concept. It stays free of MUI/JSX: `icon` is a typed
// IconKey resolved by the presentation seam, and `color` is a raw token (a
// later step hoists brand colors into the theme).

export type DomainAreaName = "Leadership" | "Backend";

/** How an area's Skills are laid out in the grid — per-area presentation config. */
export interface SkillsLayout {
  columns: { xs: number; sm: number; md: number };
  groupByCategory: boolean;
}

export interface DomainArea {
  name: DomainAreaName;
  /** Section heading shown above the area. */
  heading: string;
  /** Short prose describing the area. */
  blurb: string;
  /** Title of the area's service card. */
  serviceTitle: string;
  /** Brand accent for the area (hover border + service card background). */
  color: string;
  /** Icon identity, resolved to a concrete MUI icon by the presentation seam. */
  icon: IconKey;
  achievements: readonly Achievement[];
  skills: readonly Skill[];
  skillsLayout: SkillsLayout;
}

// Adding or renaming a Domain Area is one edit here — no parallel arrays, no new
// props threaded through page.tsx, no new branch in HeroContent.
export const domainAreas: readonly DomainArea[] = [
  {
    name: "Leadership",
    heading: "Leadership & Engineering Management",
    blurb:
      "Led teams of 14 engineers across Sportsbook and Casino domains, delivering complex microservice-based systems. Focused on mentoring, technical excellence, and stakeholder collaboration.",
    serviceTitle: "Leadership & Management: Team Growth, Delivery",
    color: "#5f9610",
    icon: "groups",
    achievements: leadershipAchievements,
    skills: leadershipSkills,
    skillsLayout: { columns: { xs: 1, sm: 2, md: 2 }, groupByCategory: false },
  },
  {
    name: "Backend",
    heading: "Technical Development Expertise",
    blurb:
      "6+ years building scalable systems in Scala and Rust. Expert in microservices, event-driven architectures, and distributed systems on Kubernetes/GCP.",
    serviceTitle: "Backend Development: Rust, Scala, Microservices",
    color: "#c55a0d",
    icon: "code",
    achievements: technicalAchievements,
    skills: technicalSkills,
    skillsLayout: { columns: { xs: 1, sm: 2, md: 3 }, groupByCategory: true },
  },
];
