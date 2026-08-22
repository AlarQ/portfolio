// PROTOTYPE ROUTE - throwaway (content/diagrams/_prototype/README.md).
// Every prototype scene in one look variant, switched by ?v=1|2|3 from the
// floating bar. Delete with the rest of the prototype once a variant wins.
import Link from "next/link";

const VARIANTS = [
  { id: "1", name: "200x52 (elk)", note: "one word per box, uniform 200x52 at 14px" },
  {
    id: "2",
    name: "168x44 (dagre)",
    note: "one word per box, uniform 168x44 at 13px, dagre packs the ranks tighter",
  },
  {
    id: "3",
    name: "168x44 + grid chain",
    note: "same box as v2; feature-flow's chain is packed by a grid container (14px gap) instead of the engine's ~110px ranks, and edge labels are dropped",
  },
];

const SCENES = [
  "feature-flow",
  "task-states",
  "validate-panel",
  "learning-loop",
  "hyperion-monorepo-migration",
  "bondsmith-architecture",
];

export default async function PrototypeDiagrams({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant = VARIANTS.find((candidate) => candidate.id === v) ?? VARIANTS[0];

  return (
    <main className="mx-auto max-w-content px-4 pt-10 pb-32">
      <h1 className="font-bold text-2xl">Diagram look prototype</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Variant {variant.id} - {variant.name}: {variant.note}. Rendered at the ~640px prose column.
      </p>

      {SCENES.map((scene) => (
        <section key={scene} className="mt-10">
          <h2 className="font-semibold text-lg">{scene}</h2>
          <figure className="mt-3 overflow-x-auto bg-background">
            {/* biome-ignore lint/performance/noImgElement: prototype, pre-rendered SVG */}
            <img
              src={`/diagrams/_prototype/${scene}-v${variant.id}-light.svg`}
              alt={`${scene} light`}
              className="mx-auto block h-auto max-w-full dark:hidden"
            />
            {/* biome-ignore lint/performance/noImgElement: prototype, pre-rendered SVG */}
            <img
              src={`/diagrams/_prototype/${scene}-v${variant.id}-dark.svg`}
              alt={`${scene} dark`}
              className="mx-auto hidden h-auto max-w-full dark:block"
            />
          </figure>
        </section>
      ))}

      <nav className="fixed inset-x-0 bottom-4 mx-auto flex w-fit gap-2 rounded-pill border border-border bg-card px-3 py-2 shadow-lg">
        {VARIANTS.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/prototype-diagrams?v=${candidate.id}`}
            className={`rounded-pill px-3 py-1 text-sm ${
              candidate.id === variant.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            v{candidate.id} {candidate.name}
          </Link>
        ))}
      </nav>
    </main>
  );
}
