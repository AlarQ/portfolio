import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Newsletter } from "./Newsletter";

const HN_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.998l4.257-7.774h-1.729l-2.169 4.359c-.203.435-.377.821-.522 1.163a15 15 0 0 0-.508-1.163L9.72 5.896z" />
  </svg>
);

export interface PostEndCardProps {
  readonly blogHref: string;
  readonly hnUrl?: string;
  readonly heading?: string;
  readonly body?: string;
  readonly newsletterHeading: string;
  readonly newsletterCtaLabel?: string;
  readonly newsletterAction?: string;
}

/**
 * Condensed end-of-post card (prototype Variant D, promoted): one heading +
 * one line of copy, a small icon-row of actions ("Back to the blog" /
 * "Discuss on HN"), a divider, then a compact `Newsletter` form. When `hnUrl`
 * is absent, only the "Back to the blog" button renders - no orphaned HN
 * button/icon. Page-agnostic (no app-route imports, no `NEWSLETTER_ACTION`
 * import) - the caller passes `newsletterAction`.
 */
export function PostEndCard({
  blogHref,
  hnUrl,
  heading = "Thanks for reading",
  body = "More like it are on the way - stick around or say hi.",
  newsletterHeading,
  newsletterCtaLabel = "Subscribe",
  newsletterAction,
}: PostEndCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border p-8">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{heading}</h2>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={blogHref}>Back to the blog</Link>
          </Button>
          {hnUrl ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={hnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2 text-orange-600 dark:text-orange-500"
              >
                {HN_ICON}
                Discuss on HN
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      <div className="border-t border-border pt-5">
        <Newsletter
          heading={newsletterHeading}
          ctaLabel={newsletterCtaLabel}
          action={newsletterAction}
        />
      </div>
    </section>
  );
}
