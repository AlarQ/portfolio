import { Card, CardDescription, CardHeader } from "@/components/ui/card";

export interface AreaHeadlineCardProps {
  /** The Domain Area's name (e.g. "Leadership"). */
  readonly name: string;
  /** The Domain Area's offering — its headline statement. */
  readonly headline: string;
}

/**
 * `Molecules/AreaHeadlineCard`: renders a Domain Area's `headline` (its
 * offering) in a `ui/card`. Props-injected — never reads `src/data/domains.ts`
 * — so it is exercisable in isolation in Storybook, mirroring the
 * `IdentityRail` contract. Binds only semantic tokens.
 *
 * The name is an `<h2>` on the assumption the card sits under the page `<h1>`
 * (true on `/author`, whose sibling sections are also `<h2>`); the panel's
 * inner lists use `<h3>`.
 */
export function AreaHeadlineCard({ name, headline }: AreaHeadlineCardProps) {
  return (
    <Card data-slot="area-headline-card">
      <CardHeader>
        <h2 className="text-lg font-semibold leading-none text-foreground">{name}</h2>
        <CardDescription className="text-base text-muted-foreground">{headline}</CardDescription>
      </CardHeader>
    </Card>
  );
}
