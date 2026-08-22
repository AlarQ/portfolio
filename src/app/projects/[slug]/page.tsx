import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { ProjectDetail } from "@/components/pages/ProjectDetail";
import { navItems } from "@/data/navItems";
import { getProject, getProjects } from "@/data/projects";

export function generateStaticParams(): Array<{ slug: string }> {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-Project document title (FR-6): title = Project title, description =
 *  tagline. Site-default OG image - no per-Project `openGraph.images`. */
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.title, description: project.tagline } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  // The loader's validated, Brief-having Project set is the single source of
  // truth: a slug with no Project has no detail page (belt-and-braces -
  // generateStaticParams already only maps this same set).
  const project = getProject(slug);
  if (!project) notFound();

  // Dynamic import over content/projects; slug is a member of the loader's
  // already-validated set, so only whitelisted paths can reach this call
  // (mirrors blog/[slug] - single slug-validation gate, CLAUDE.md).
  const { default: BriefBody } = await import(`../../../../content/projects/${slug}.mdx`);

  return (
    <div className="flex min-h-dvh flex-col gap-2 md:gap-10">
      <Header items={navItems} activeHref="/projects" />
      <main className="flex-1 pb-2 md:pb-12">
        <ProjectDetail project={project}>
          <BriefBody />
        </ProjectDetail>
      </main>
      <Footer />
    </div>
  );
}
