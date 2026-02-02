export interface Project {
  id: string;
  title: string;
  description: string;
  mvpProgress: number;
}

export const projects: readonly Project[] = [
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description:
      "A full-stack e-commerce solution with real-time inventory management, secure payment processing, and an intuitive admin dashboard for product management.",
    mvpProgress: 85,
  },
  {
    id: "task-management-app",
    title: "Task Management App",
    description:
      "A collaborative project management tool featuring kanban boards, real-time updates, team assignments, and progress tracking with detailed analytics.",
    mvpProgress: 65,
  },
  {
    id: "ai-content-generator",
    title: "AI Content Generator",
    description:
      "An intelligent content creation platform that leverages machine learning to generate blog posts, social media content, and marketing copy.",
    mvpProgress: 40,
  },
  {
    id: "fitness-tracker",
    title: "Fitness Tracker",
    description:
      "A health and fitness application with workout planning, nutrition tracking, progress visualization, and integration with wearable devices.",
    mvpProgress: 90,
  },
];

export function isValidProject(project: unknown): project is Project {
  return (
    typeof project === "object" &&
    project !== null &&
    "id" in project &&
    typeof (project as Project).id === "string" &&
    "title" in project &&
    typeof (project as Project).title === "string" &&
    "description" in project &&
    typeof (project as Project).description === "string" &&
    "mvpProgress" in project &&
    typeof (project as Project).mvpProgress === "number" &&
    (project as Project).mvpProgress >= 0 &&
    (project as Project).mvpProgress <= 100
  );
}

export function getProjectsByProgress(minProgress: number): readonly Project[] {
  return projects.filter((project) => project.mvpProgress >= minProgress);
}

export function getProjectsSortedByProgress(): readonly Project[] {
  return [...projects].sort((a, b) => b.mvpProgress - a.mvpProgress);
}
