import type { ReactNode } from "react";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Projects } from "@/components/pages/Projects";
import { navItems } from "@/data/navItems";
import { buildProjectSet } from "@/data/projectLoader";
import { getProjects, projects } from "@/data/projects";

/**
 * The `/projects` index route (FR-4). Server component (SSG): it composes the
 * site chrome - `Header` (with the real `navItems`, `/projects` active) and
 * `Footer` - around the client `pages/Projects` screen, mirroring how the
 * `Author` page assembles its chrome. `pages/Projects` owns only the
 * tab-strip ↔ summary interaction and stays chrome-free.
 *
 * The Projects it renders come from `buildProjectSet` - the single
 * slug-validation gate (FR-2): an invalid slug is skipped with a build
 * warning before it can reach any downstream layer. Array order in
 * `src/data/projects.ts` is authoritative, so `projects[0]` is the
 * default-selected Project.
 *
 * Each Brief-having Project's MDX body is dynamically imported here and
 * pre-rendered server-side into a `briefs` map, so the Brief renders inline
 * in the tab-strip panel instead of at a separate `/projects/[slug]` route.
 * It renders through the existing MDX→presentation seam
 * (`mdx-components.tsx` → `mdxPresentation.tsx`, shared with the Blog) - no
 * second render path or component map is introduced here. `getProjects()` is
 * the single validated, Brief-having, enumerate-not-glob source (FR-8/FR-9) -
 * this loop never globs `content/projects/` itself.
 */
export default async function ProjectsPage() {
  const projectSet = buildProjectSet(projects);

  const briefs: Record<string, ReactNode> = {};
  for (const project of getProjects()) {
    const { default: BriefBody } = await import(`../../../content/projects/${project.slug}.mdx`);
    briefs[project.slug] = <BriefBody />;
  }

  return (
    <div className="flex min-h-dvh flex-col gap-2 md:gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 pb-2 md:pb-12">
        <Projects projects={projectSet} briefs={briefs} />
      </main>
      <Footer />
    </div>
  );
}
