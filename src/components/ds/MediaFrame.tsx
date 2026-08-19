import Image from "next/image";

export interface MediaFrameProps {
  readonly src: string;
  readonly alt: string;
  readonly priority?: boolean;
}

/**
 * `ds/` atom-ish frame shared by a still Capability and a `ClipRow` poster
 * (FR-10): fixed `aspect-video`, bordered/rounded/clipped, semantic tokens
 * only (`border-border`, `bg-muted`) - media never brings its own
 * border/shadow. `next/image` at the authored 1280×720 budget (FR-12),
 * `object-fit: contain` so a non-16:9 source never crops. Height is capped
 * at ~200px from `md:` up (FR-9) via `md:max-h-[200px]` - an arbitrary
 * non-color Tailwind value, allowed per `CLAUDE.md`'s token rule (only
 * arbitrary *color* values are banned) - with `sizes` narrowed to match the
 * resulting ~356px desktop width (200px tall at 16:9). Server-safe - no
 * `"use client"` here; `ClipRow` layers its play toggle on top.
 */
export function MediaFrame({ src, alt, priority }: MediaFrameProps) {
  return (
    <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted md:max-h-[200px]">
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={720}
        priority={priority}
        sizes="(min-width: 768px) 356px, 100vw"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
