/**
 * Project data structure and sample projects
 * Following DRY principles with TypeScript utility types
 */

/**
 * Project interface defining the structure of a project
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Project title displayed on the card */
  title: string;
  /** Brief description of the project */
  description: string;
  /** MVP progress percentage (0-100) */
  mvpProgress: number;
}

/**
 * Sample projects with varying MVP progress levels
 * Exported as a readonly array to prevent mutation
 */
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

/**
 * Type guard to validate project data
 * Ensures runtime type safety when working with project objects
 */
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

/**
 * Get projects filtered by MVP progress threshold
 * @param minProgress - Minimum MVP progress percentage (inclusive)
 * @returns Array of projects meeting the threshold
 */
export function getProjectsByProgress(minProgress: number): readonly Project[] {
  return projects.filter((project) => project.mvpProgress >= minProgress);
}

/**
 * Get projects sorted by MVP progress (descending)
 * @returns Sorted array of projects
 */
export function getProjectsSortedByProgress(): readonly Project[] {
  return [...projects].sort((a, b) => b.mvpProgress - a.mvpProgress);
}
