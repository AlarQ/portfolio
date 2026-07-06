import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NewsletterProps {
  readonly heading: string;
  readonly description?: string;
  readonly ctaLabel?: string;
}

/**
 * Bespoke molecule for a newsletter signup block, composing the shadcn
 * `Input` and `Button` primitives. Presentational only — no submission
 * wiring. Binds only to semantic Tailwind classes — no raw hex/palette
 * lookups (`no-direct-palette-import`).
 */
export function Newsletter({ heading, description, ctaLabel = "Subscribe" }: NewsletterProps) {
  return (
    <form className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">{heading}</h3>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input type="email" placeholder="you@example.com" aria-label="Email address" />
        <Button type="submit">{ctaLabel}</Button>
      </div>
    </form>
  );
}
