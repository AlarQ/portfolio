import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ConclusionProps {
  readonly heading: string;
  readonly body: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
}

/**
 * Bespoke molecule for an end-of-article closing block: a heading, closing
 * copy, and an optional CTA composing the shadcn `Button` primitive. Binds
 * only to semantic Tailwind classes — no raw hex/palette lookups
 * (`no-direct-palette-import`).
 */
export function Conclusion({ heading, body, ctaLabel, ctaHref }: ConclusionProps) {
  return (
    <section className="flex flex-col items-start gap-4 border-t border-border pt-8">
      <h2 className="text-2xl font-semibold text-foreground">{heading}</h2>
      <p className="text-base text-muted-foreground">{body}</p>
      {ctaLabel && ctaHref ? (
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}
