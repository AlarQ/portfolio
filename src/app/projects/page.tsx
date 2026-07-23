import type { ComponentType, ReactNode } from "react";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Projects } from "@/components/pages/Projects";
import { navItems } from "@/data/navItems";
import { buildProjectSet } from "@/data/projectLoader";
import { getProjects, type Project, projects } from "@/data/projects";

/**
 * Builds the `slug -> rendered Brief` map for every Brief-having Project
 * (`getProjects()`'s single validated, enumerate-not-glob source -
 * FR-8/FR-9). `importBrief` is injectable (real dynamic `import()` by
 * default) purely so this loop is unit-testable without a real MDX loader in
 * the test environment - mirrors `briefExists` being injectable in
 * `filterProjectsWithBrief` (`src/data/projectLoader.ts`).
 */
export async function buildBriefs(
  briefProjects: readonly Project[],
  importBrief: (slug: string) => Promise<{ default: ComponentType }> = (slug) =>
    import(`../../../content/projects/${slug}.mdx`)
): Promise<Record<string, ReactNode>> {
  const briefs: Record<string, ReactNode> = {};
  for (const project of briefProjects) {
    const { default: BriefBody } = await importBrief(project.slug);
    briefs[project.slug] = <BriefBody />;
  }
  return briefs;
}

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
 * Each Brief-having Project's MDX body is pre-rendered server-side into a
 * `briefs` map via `buildBriefs`, so the Brief renders inline in the
 * tab-strip panel instead of at a separate `/projects/[slug]` route. It
 * renders through the existing MDX→presentation seam (`mdx-components.tsx` →
 * `mdxPresentation.tsx`, shared with the Blog) - no second render path or
 * component map is introduced here.
 */
export default async function ProjectsPage() {
  const projectSet = buildProjectSet(projects);
  const briefs = await buildBriefs(getProjects());

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
