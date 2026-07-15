import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Projects } from "@/components/pages/Projects";
import { navItems } from "@/data/navItems";
import { buildProjectSet } from "@/data/projectLoader";
import { getProjects, projects } from "@/data/projects";

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
 * default-selected Project. The "Read full brief" link (`briefHref`) is now
 * wired (FR-8/FR-9, task 005): `briefHrefBySlug` is derived from
 * `getProjects()` — the same `filterProjectsWithBrief(buildProjectSet(...))`
 * pass the `/projects/[slug]` route uses — rather than re-deriving the
 * "has a Brief" answer independently here, so the two routes can never drift
 * on which slugs have a Brief. A Project with no Brief renders its summary
 * without the link rather than a link to a 404. Built here (not as a
 * function prop) because `pages/Projects` is a Client Component and a Server
 * Component can only pass it serializable data across that boundary.
 */
export default function ProjectsPage() {
  const projectSet = buildProjectSet(projects);
  const briefHrefBySlug = Object.fromEntries(
    getProjects().map((project) => [project.slug, `/projects/${project.slug}`])
  );

  return (
    <div className="flex min-h-dvh flex-col gap-2 md:gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 py-2 md:py-12">
        <Projects projects={projectSet} briefHrefBySlug={briefHrefBySlug} />
      </main>
      <Footer />
    </div>
  );
}
