import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROSE_LINK_CLASS } from "@/utils/mdxPresentationText";

export interface NewsletterProps {
  readonly eyebrow?: string;
  readonly heading: string;
  readonly description?: string;
  readonly ctaLabel?: string;
  readonly hint?: string;
  readonly privacyHref?: string;
  readonly action?: string;
}

/**
 * Bespoke molecule for the Figma "Stories and interviews" newsletter block,
 * composing the shadcn `Input` and `Button` primitives. A centered column on
 * the page background (no card border/fill): purple eyebrow, large heading,
 * supporting text, inline email + primary Subscribe, and an optional privacy
 * hint with an underlined link. Presentational by default; passing `action`
 * wires the form as a direct same-tab HTML POST to an ESP embed endpoint
 * (e.g. Buttondown) - no backend, no client JS. Binds only to semantic
 * Tailwind classes - no raw hex/palette lookups (`no-direct-palette-import`).
 */
export function Newsletter({
  eyebrow = "Newsletter",
  heading,
  description,
  ctaLabel = "Subscribe",
  hint,
  privacyHref,
  action,
}: NewsletterProps) {
  return (
    <form
      className="flex flex-col items-center gap-4 text-center"
      action={action}
      method={action ? "post" : undefined}
    >
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h3 className="text-3xl font-semibold text-foreground sm:text-4xl">{heading}</h3>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
      <div className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name={action ? "email" : undefined}
          required={action ? true : undefined}
          placeholder="Enter your email"
          aria-label="Email address"
        />
        <Button type="submit">{ctaLabel}</Button>
      </div>
      {hint ? (
        <p className="text-sm text-muted-foreground">
          {hint}
          {privacyHref ? (
            <>
              {" "}
              <Link href={privacyHref} className={PROSE_LINK_CLASS}>
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
