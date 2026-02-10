export type SkillCategory =
  | "Leadership"
  | "Languages"
  | "Architecture"
  | "Infrastructure"
  | "Databases"
  | "Tools";

export interface Skill {
  name: string;
  category: SkillCategory;
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
  { name: "Team Leadership", category: "Leadership" },
  { name: "Mentoring", category: "Leadership" },
  { name: "Delivery Ownership", category: "Leadership" },
  { name: "Stakeholder Management", category: "Leadership" },
  { name: "Cross-Team Collaboration", category: "Leadership" },
  { name: "Technical Standards (ADRs)", category: "Leadership" },
  { name: "Tech Debt Management", category: "Leadership" },
  { name: "Agile/Scrum", category: "Tools" },
  { name: "Jira", category: "Tools" },
  { name: "Confluence", category: "Tools" },
];

// Technical Skills
export const technicalSkills: readonly Skill[] = [
  // Languages
  { name: "Rust (Tokio)", category: "Languages", yearsOfExperience: 2 },
  { name: "Scala (Cats)", category: "Languages", yearsOfExperience: 6 },

  // Architecture
  { name: "Microservices", category: "Architecture" },
  { name: "Monolithic Architectures", category: "Architecture" },
  { name: "Distributed Systems", category: "Architecture" },
  { name: "Event-Driven Systems", category: "Architecture" },
  { name: "API Design", category: "Architecture" },
  { name: "System Integration", category: "Architecture" },

  // Infrastructure
  { name: "Kafka", category: "Infrastructure" },
  { name: "Kubernetes", category: "Infrastructure" },
  { name: "GCP", category: "Infrastructure" },

  // Databases
  { name: "PostgreSQL", category: "Databases" },
  { name: "ScyllaDB", category: "Databases" },
  { name: "Elasticsearch", category: "Databases" },

  // Tools
  { name: "CI/CD (GitLab, GitHub)", category: "Tools" },
  { name: "ELK Stack", category: "Tools" },
  { name: "Datadog", category: "Tools" },
];
