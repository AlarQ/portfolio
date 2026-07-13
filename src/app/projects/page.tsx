import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Projects } from "@/components/pages/Projects";
import { navItems } from "@/data/navItems";
import { buildProjectSet } from "@/data/projectLoader";
import { projects } from "@/data/projects";

/**
 * The `/projects` index route (FR-4). Server component (SSG): it composes the
 * site chrome — `Header` (with the real `navItems`, `/projects` active) and
 * `Footer` — around the client `pages/Projects` screen, mirroring how the
 * `Author` page assembles its chrome. `pages/Projects` owns only the
 * tab-strip ↔ summary interaction and stays chrome-free.
 *
 * The Projects it renders come from `buildProjectSet` — the single
 * slug-validation gate (FR-2): an invalid slug is skipped with a build
 * warning before it can reach any downstream layer. Array order in
 * `src/data/projects.ts` is authoritative, so `projects[0]` is the
 * default-selected Project. The "Read full brief" link (`briefHref`) is
 * intentionally not wired here — the Brief route is Task 005 (FR-8/FR-9).
 */
export default function ProjectsPage() {
  const projectSet = buildProjectSet(projects);

  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 py-12">
        <Projects projects={projectSet} />
      </main>
      <Footer />
    </div>
  );
}
