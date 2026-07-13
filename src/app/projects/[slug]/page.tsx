import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { navItems } from "@/data/navItems";
import { buildProjectSet, filterProjectsWithBrief } from "@/data/projectLoader";
import { projects } from "@/data/projects";

/**
 * The loader's validated Project set, further narrowed to Projects with a
 * matching Brief body (FR-9): only a slug that survives both `buildProjectSet`
 * and `filterProjectsWithBrief` gets a Brief route, mirroring
 * `getPost`/`getPosts` in the blog `[slug]` route. A Project with no Brief
 * warns via `filterProjectsWithBrief` and is simply absent here — `getProject`
 * returns `undefined`, so the route 404s via the `notFound()` call below
 * rather than throwing on a missing dynamic import.
 */
function getProject(slug: string) {
  return filterProjectsWithBrief(buildProjectSet(projects)).find(
    (project) => project.slug === slug
  );
}

/**
 * `generateStaticParams` enumerates ONLY the already-validated `projects.ts`
 * slug set that also has a matching Brief body — it never reads
 * `content/projects/` directory contents itself (enumerate-not-glob,
 * FR-8/FR-9); `filterProjectsWithBrief` only checks existence for each
 * already-known candidate slug, never scans for new ones. Combined with
 * `dynamicParams = false` below, a slug outside this set can never resolve to
 * a route, and a Project with no Brief gets no route (missing-brief-warning).
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return filterProjectsWithBrief(buildProjectSet(projects)).map((project) => ({
    slug: project.slug,
  }));
}

export const dynamicParams = false;

interface ProjectBriefPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-Brief document title (FR-9): mirrors the blog route's `generateMetadata`. */
export async function generateMetadata({ params }: ProjectBriefPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.title } : {};
}

export default async function ProjectBriefPage({ params }: ProjectBriefPageProps) {
  const { slug } = await params;

  const project = getProject(slug);
  if (!project) notFound();

  // Dynamic import over content/projects; slug is a member of the loader's
  // already-validated set, so only whitelisted paths can reach this call
  // (single slug-validation gate — no second gate here).
  const { default: BriefBody } = await import(`../../../../content/projects/${slug}.mdx`);

  // The Brief body renders through the existing MDX→presentation seam
  // (`mdx-components.tsx` → `mdxPresentation.tsx`, shared with the Blog) —
  // no second render path or component map is introduced here (ADR-0002).
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 py-12">
        <article className="mx-auto max-w-content px-6">
          <h1 className="text-3xl font-semibold leading-tight">{project.title}</h1>
          <BriefBody />
        </article>
      </main>
      <Footer />
    </div>
  );
}
