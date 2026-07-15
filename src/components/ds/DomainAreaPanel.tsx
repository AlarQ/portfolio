import { Badge } from "@/components/ui/badge";
import type { DomainArea } from "@/data/domains";
import { skillPresentation } from "@/utils/skillPresentation";
import { AreaHeadlineCard } from "./AreaHeadlineCard";

export interface DomainAreaPanelProps {
  readonly domain: DomainArea;
}

/**
 * `Organisms/DomainAreaPanel`: one Domain Area on `/author` — its offering
 * (`AreaHeadlineCard`), the Achievements that evidence it, and the Skills that
 * rate it. Props-injected (never reads `src/data/domains.ts`) so its
 * empty-Achievements / empty-Skills / long-content states are exercisable in
 * isolation in Storybook, mirroring the `IdentityRail` contract.
 *
 * Each Skill's level → Badge hue + label is resolved through the
 * `skillPresentation` seam only — never a raw level→hue switch here. Empty
 * Achievement/Skill groups are omitted, not rendered blank.
 */
export function DomainAreaPanel({ domain }: DomainAreaPanelProps) {
  return (
    <section
      data-slot="domain-area-panel"
      className="flex flex-col gap-4 border-t border-border pt-8"
    >
      <AreaHeadlineCard name={domain.name} headline={domain.headline} />

      {domain.achievements.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {domain.achievements.map((achievement) => (
              <li key={achievement.id} className="leading-relaxed text-muted-foreground">
                {achievement.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {domain.skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Skills</h3>
          <ul className="flex flex-col gap-2">
            {domain.skills.map((skill) => {
              const { label, category } = skillPresentation(skill.level);
              return (
                <li key={skill.name} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground">
                    {skill.name}
                    {skill.years !== undefined && ` · ${skill.years}y`}
                  </span>
                  <Badge category={category}>{label}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
