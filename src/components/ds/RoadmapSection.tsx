import { StatusDot } from "@/components/ui/status-dot";
import type { Feature } from "@/data/projects";
import type { MilestoneProgress } from "@/data/roadmap";
import {
  FEATURE_STATUS_LABELS,
  featureStatusPresentation,
  milestoneDividerPresentation,
} from "@/utils/projectPresentation";

export interface RoadmapSectionProps {
  /** Pre-derived via `deriveMilestoneProgress(project.roadmap)` - `toward`
   *  and `beyond` Features already split and grouped, authored order
   *  preserved (FR-3, FR-11). Never grouped/sorted/computed here. */
  readonly progress: MilestoneProgress;
}

function FeatureRow({ feature }: { readonly feature: Feature }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <StatusDot tone={featureStatusPresentation(feature.status)} />
      <span className="sr-only">{FEATURE_STATUS_LABELS[feature.status]}: </span>
      <span className="text-foreground">{feature.name}</span>
    </li>
  );
}

/**
 * `ds/` organism rendering a Project's Roadmap (FR-11): two ordered lists in
 * authored order - `toward` Features, then a visible `<Milestone> · N of M
 * shipped` divider rendered as a centred pill chip between two hairlines (with an `After <Milestone>` `h3` heading when `beyond`
 * is non-empty), then `beyond` Features. Two `<ol>`s rather than one
 * continuous list so the divider and heading aren't swallowed into either
 * group's list semantics for screen-reader users - no board/two-column
 * layout, no second meter - Milestone Progress already renders once, in the
 * detail header. Each row's Feature Status lives in its accessible name
 * (`sr-only` text) via `featureStatusPresentation`/`FEATURE_STATUS_LABELS`,
 * never as visible text. The divider's success color is bound through the
 * same closed `StatusTone` seam via `milestoneDividerPresentation`.
 */
export function RoadmapSection({ progress }: RoadmapSectionProps) {
  const { milestoneName, toward, beyond, shippedToward, totalToward } = progress;

  return (
    <section aria-labelledby="roadmap" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="roadmap" className="text-xs font-bold tracking-wide text-foreground uppercase">
          Roadmap
        </h2>
        <p className="text-sm text-muted-foreground md:hidden">
          {progress.percent}% to {milestoneName}
        </p>
      </div>

      <ol className="flex flex-col">
        {toward.map((feature) => (
          <FeatureRow key={feature.name} feature={feature} />
        ))}
      </ol>

      <p className="my-2 flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-primary" />
        <span className="inline-flex items-center gap-2 rounded-pill border border-primary px-3 py-0.5 text-xs font-semibold tracking-wide text-primary">
          <StatusDot tone={milestoneDividerPresentation(progress)} />
          {milestoneName} · {shippedToward} of {totalToward} shipped
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </p>

      {beyond.length > 0 && (
        <>
          <h3 className="pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            After {milestoneName}
          </h3>
          <ol className="flex flex-col">
            {beyond.map((feature) => (
              <FeatureRow key={feature.name} feature={feature} />
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
