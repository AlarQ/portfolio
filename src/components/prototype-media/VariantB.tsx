// PROTOTYPE - throwaway (wayfinder #96).
// B - "Long clip + stills": one autoplaying walkthrough, supporting stills beneath.
"use client";

import { FakeClip, FakeStill } from "./FakeClip";
import { longClip, stills } from "./fixtures";

export const variantBName = "One long clip + stills";

export function VariantB() {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-foreground">In action</h3>
      <FakeClip label={longClip.label} seconds={longClip.seconds} hue={longClip.hue} />
      <p className="text-sm text-muted-foreground">{longClip.caption}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stills.map((still) => (
          <FakeStill key={still.label} label={still.label} hue={still.hue} />
        ))}
      </div>
    </section>
  );
}
