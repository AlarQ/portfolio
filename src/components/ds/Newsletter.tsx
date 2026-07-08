import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NewsletterProps {
  readonly eyebrow?: string;
  readonly heading: string;
  readonly description?: string;
  readonly ctaLabel?: string;
  readonly hint?: string;
  readonly privacyHref?: string;
}

/**
 * Bespoke molecule for the Figma "Stories and interviews" newsletter block,
 * composing the shadcn `Input` and `Button` primitives. A centered column on
 * the page background (no card border/fill): purple eyebrow, large heading,
 * supporting text, inline email + primary Subscribe, and an optional privacy
 * hint with an underlined link. Presentational only — no submission wiring.
 * Binds only to semantic Tailwind classes — no raw hex/palette lookups
 * (`no-direct-palette-import`).
 */
export function Newsletter({
  eyebrow = "Newsletter",
  heading,
  description,
  ctaLabel = "Subscribe",
  hint,
  privacyHref,
}: NewsletterProps) {
  return (
    <form className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h3 className="text-3xl font-semibold text-foreground sm:text-4xl">{heading}</h3>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
      <div className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <Input type="email" placeholder="Enter your email" aria-label="Email address" />
        <Button type="submit">{ctaLabel}</Button>
      </div>
      {hint ? (
        <p className="text-sm text-muted-foreground">
          {hint}
          {privacyHref ? (
            <>
              {" "}
              <Link href={privacyHref} className="underline">
                privacy policy
              </Link>
              .
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
