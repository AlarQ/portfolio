export interface Achievement {
  description: string;
  icon?: string;
}

// Leadership Achievements
export const leadershipAchievements: readonly Achievement[] = [
  {
    description: "Led 14 engineers across Sportsbook and Casino domains",
  },
  {
    description: "End-to-end delivery ownership of complex microservice-based systems",
  },
  {
    description: "Mentoring & team growth through technical guidance and career development",
  },
  {
    description: "Building standards through ADRs and tech debt management processes",
  },
];

// Technical Achievements
export const technicalAchievements: readonly Achievement[] = [
  {
    description: "Built Rust integration library accelerating external service delivery",
  },
  {
    description: "Designed and implemented microservices & event-driven architectures",
  },
  {
    description: "Built high-performance systems on Kubernetes and GCP",
  },
  {
    description: "Architected distributed systems handling millions of transactions",
  },
];
