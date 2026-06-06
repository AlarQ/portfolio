export type SkillCategory =
  | "Leadership"
  | "Languages"
  | "Architecture"
  | "Infrastructure"
  | "Databases"
  | "Tools";

// Typed icon identity for a Skill. Resolved to a concrete MUI icon by the
// exhaustive registry in utils/skillIcons.tsx. Keeping this a string union
// (not a ReactElement) keeps this data module free of MUI/JSX.
export type IconKey =
  | "groups"
  | "school"
  | "assignment"
  | "handshake"
  | "hub"
  | "factCheck"
  | "build"
  | "accountTree"
  | "work"
  | "code"
  | "terminal"
  | "architecture"
  | "dynamicForm"
  | "api"
  | "integration"
  | "router"
  | "cloud"
  | "storage"
  | "settings"
  | "monitorHeart";

export interface Skill {
  name: string;
  category: SkillCategory;
  icon: IconKey;
  yearsOfExperience?: number;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface SkillGroup {
  category: SkillCategory;
  skills: Skill[];
}

// Category color mapping following ReadingSection pattern
export const skillCategoryColors: Record<SkillCategory, string> = {
  Leadership: "#5f9610", // limeGreen from theme
  Languages: "#c55a0d", // orange from theme
  Architecture: "#0ea5e9", // primary.main from theme
  Infrastructure: "#f97316", // secondary.main from theme
  Databases: "#84cc16", // lime from ReadingSection
  Tools: "#64748b", // slate from ReadingSection
};

// Leadership Skills
export const leadershipSkills: readonly Skill[] = [
  { name: "Team Leadership", category: "Leadership", icon: "groups" },
  { name: "Mentoring", category: "Leadership", icon: "school" },
  { name: "Delivery Ownership", category: "Leadership", icon: "assignment" },
  { name: "Stakeholder Management", category: "Leadership", icon: "handshake" },
  { name: "Cross-Team Collaboration", category: "Leadership", icon: "hub" },
  { name: "Technical Standards (ADRs)", category: "Leadership", icon: "factCheck" },
  { name: "Tech Debt Management", category: "Leadership", icon: "build" },
  { name: "Agile/Scrum", category: "Tools", icon: "accountTree" },
  { name: "Jira", category: "Tools", icon: "work" },
  { name: "Confluence", category: "Tools", icon: "work" },
];

// Technical Skills
export const technicalSkills: readonly Skill[] = [
  // Languages
  { name: "Rust (Tokio)", category: "Languages", icon: "terminal", yearsOfExperience: 2 },
  { name: "Scala (Cats)", category: "Languages", icon: "code", yearsOfExperience: 6 },

  // Architecture
  { name: "Microservices", category: "Architecture", icon: "accountTree" },
  { name: "Monolithic Architectures", category: "Architecture", icon: "architecture" },
  { name: "Distributed Systems", category: "Architecture", icon: "hub" },
  { name: "Event-Driven Systems", category: "Architecture", icon: "dynamicForm" },
  { name: "API Design", category: "Architecture", icon: "api" },
  { name: "System Integration", category: "Architecture", icon: "integration" },

  // Infrastructure
  { name: "Kafka", category: "Infrastructure", icon: "router" },
  { name: "Kubernetes", category: "Infrastructure", icon: "cloud" },
  { name: "GCP", category: "Infrastructure", icon: "cloud" },

  // Databases
  { name: "PostgreSQL", category: "Databases", icon: "storage" },
  { name: "ScyllaDB", category: "Databases", icon: "storage" },
  { name: "Elasticsearch", category: "Databases", icon: "storage" },

  // Tools
  { name: "CI/CD (GitLab, GitHub)", category: "Tools", icon: "settings" },
  { name: "ELK Stack", category: "Tools", icon: "monitorHeart" },
  { name: "Datadog", category: "Tools", icon: "monitorHeart" },
];
