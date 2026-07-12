/** PROTOTYPE — throwaway. Small shared bits reused across the variants. */
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type PrototypeProject, STATUS_META } from "./_fixtures";

/** Status as a coloured pill (badge category hues from the design system). */
export function StatusPill({ status }: { status: PrototypeProject["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge category={meta.category}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </Badge>
  );
}

/** MVP Progress as a labelled meter. */
export function MvpProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>MVP Progress</span>
        <span className="tabular-nums text-foreground">{value}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Tech-stack chips row. */
export function TechStack({ project }: { project: PrototypeProject }) {
  return (
    <div className="flex flex-wrap gap-2">
      {project.techStack.map((t) => (
        <Badge key={t.label} category={t.category}>
          {t.label}
        </Badge>
      ))}
    </div>
  );
}

/**
 * The full brief body for one project — the "main content" every master–detail
 * variant swaps in. `showHeader` off lets a variant supply its own title (e.g.
 * an accordion row already showing the name).
 */
export function ProjectBrief({
  project,
  showHeader = true,
}: {
  project: PrototypeProject;
  showHeader?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      {showHeader && (
        <header className="flex flex-col gap-4">
          <StatusPill status={project.status} />
          <h2 className="text-3xl font-semibold text-foreground">{project.title}</h2>
          <p className="text-lg text-muted-foreground">{project.tagline}</p>
        </header>
      )}

      <MvpProgress value={project.mvpProgress} className="max-w-sm" />

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Current state</h3>
        <p className="text-base leading-7 text-muted-foreground">{project.currentState}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Tech stack</h3>
        <TechStack project={project} />
      </section>

      {project.relatedPosts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Related posts</h3>
          <div className="flex flex-col gap-1">
            {project.relatedPosts.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {r.label}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
