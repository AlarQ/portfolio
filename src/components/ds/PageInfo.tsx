import { Badge } from "@/components/ui/badge";

export interface PageInfoProps {
  readonly formattedDate: string;
  readonly readingTimeMinutes: number;
  readonly category?: string;
}

/**
 * Bespoke molecule composing the shadcn `Badge` primitive to present a
 * page/post's metadata row (published date, reading time, optional category).
 * Binds only to semantic Tailwind classes — no raw hex/palette lookups
 * (`no-direct-palette-import`).
 */
export function PageInfo({ formattedDate, readingTimeMinutes, category }: PageInfoProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <time>{formattedDate}</time>
      <Badge variant="secondary">{readingTimeMinutes} min read</Badge>
      {category ? <Badge variant="outline">{category}</Badge> : null}
    </div>
  );
}
