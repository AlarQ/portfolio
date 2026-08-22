import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Projects } from "@/components/pages/Projects";
import { navItems } from "@/data/navItems";
import { getProjects } from "@/data/projects";

/**
 * The `/projects` index route (FR-7). Server component (SSG): it composes
 * the site chrome - `Header` (with the real `navItems`, `/projects` active)
 * and `Footer` - around the server-safe `pages/Projects` screen, one
 * `ProjectCard` per Project.
 *
 * The Projects it renders come from `getProjects()` - the single validated,
 * Brief-having set (`buildProjectSet` stays the single slug-validation
 * gate). Array order in `src/data/projects/index.ts` is authoritative.
 */
export default function ProjectsPage() {
  return (
    <div className="flex min-h-dvh flex-col gap-2 md:gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 pb-2 md:pb-12">
        <Projects projects={getProjects()} />
      </main>
      <Footer />
    </div>
  );
}
