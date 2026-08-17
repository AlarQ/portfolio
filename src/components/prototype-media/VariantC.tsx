// PROTOTYPE - throwaway (wayfinder #96).
// C - "Caption-led rows": every short clip is its own row, clip beside its caption.
// No interaction cost (nothing to advance) and nothing to skip past.
"use client";

import { FakeClip } from "./FakeClip";
import { shortClips } from "./fixtures";

export const variantCName = "Caption-led clip rows";

export function VariantC() {
  return (
    <section className="flex flex-col gap-8">
      <h3 className="text-lg font-semibold text-foreground">In action</h3>
      {shortClips.map((clip, i) => (
        <div key={clip.label} className="grid items-center gap-4 md:grid-cols-2">
          <div className={i % 2 === 1 ? "md:order-2" : undefined}>
            <FakeClip label={clip.label} seconds={clip.seconds} hue={clip.hue} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">{clip.label}</p>
            <p className="text-sm text-muted-foreground">{clip.caption}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
