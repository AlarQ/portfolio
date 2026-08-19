import type { ResolvedCapability } from "@/utils/projectPresentation";
import { ClipPlaybackGroup, ClipRow } from "./ClipRow";
import { MediaFrame } from "./MediaFrame";

export interface CapabilitiesSectionProps {
  readonly capabilities: readonly ResolvedCapability[];
}

/**
 * `ds/` organism rendering a Project's Capabilities (FR-9): caption-led rows
 * that alternate sides at `md:` via `flex-row-reverse` on odd media rows
 * (never per-child `order`), DOM order always caption-then-figure. A
 * Capability without media renders as a compact full-width one-liner, never
 * an empty alternating slot. Renders nothing when `capabilities` is empty
 * (no-capabilities-no-section) - server component, no client state of its
 * own; `ClipRow`'s toggle is the only client state on the page, and only
 * wraps the list in `ClipPlaybackGroup` when a clip row exists.
 */
export function CapabilitiesSection({ capabilities }: CapabilitiesSectionProps) {
  if (capabilities.length === 0) return null;

  const hasClip = capabilities.some((capability) => capability.media?.kind === "clip");
  const clipTotal = capabilities.filter((c) => c.media?.kind === "clip").length;
  let mediaRowCount = 0;
  let clipRowCount = 0;
  let priorityAssigned = false;

  const list = (
    <ul className="flex flex-col gap-10">
      {capabilities.map((capability, index) => {
        const { media } = capability;

        // capabilities is a static, owner-authored array (never reordered/
        // inserted at runtime), so `index` is a safe, stable key component -
        // paired with `capability.text` (rather than bare index) to satisfy
        // noArrayIndexKey while staying unique even if two rows shared text.
        const key = `${capability.text}-${index}`;

        if (!media) {
          return (
            <li key={key}>
              <p className="text-sm text-foreground">{capability.text}</p>
            </li>
          );
        }

        const isReversed = mediaRowCount % 2 === 1;
        mediaRowCount += 1;
        const isPriority = !priorityAssigned;
        if (isPriority) priorityAssigned = true;

        if (media.kind === "clip") clipRowCount += 1;

        return (
          <li
            key={key}
            className={
              isReversed
                ? "flex flex-col gap-4 md:flex-row-reverse md:items-start md:gap-8"
                : "flex flex-col gap-4 md:flex-row md:items-start md:gap-8"
            }
          >
            <p className="text-sm text-foreground md:w-1/2">{capability.text}</p>
            <div className="md:w-1/2">
              {media.kind === "clip" ? (
                <ClipRow
                  id={`capability-${index}`}
                  clipSrc={media.clipSrc}
                  posterSrc={media.posterSrc}
                  label={media.label}
                  description={media.description}
                  priority={isPriority}
                  index={clipRowCount}
                  total={clipTotal}
                />
              ) : (
                <MediaFrame src={media.src} alt={media.alt} priority={isPriority} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-labelledby="capabilities-heading" className="flex flex-col gap-6">
      <h2
        id="capabilities-heading"
        className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
      >
        Capabilities
      </h2>
      {hasClip ? <ClipPlaybackGroup>{list}</ClipPlaybackGroup> : list}
    </section>
  );
}
