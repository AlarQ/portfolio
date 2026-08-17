// PROTOTYPE - throwaway (wayfinder #96).
// A - "Slider": one short clip at a time, explicit next/prev, caption under it.
"use client";

import { useState } from "react";
import { FakeClip } from "./FakeClip";
import { shortClips } from "./fixtures";
import { Button } from "@/components/ui/button";

export const variantAName = "Slider of short clips";

export function VariantA() {
  const [index, setIndex] = useState(0);
  const clip = shortClips[index];
  const step = (delta: number) =>
    setIndex((i) => (i + delta + shortClips.length) % shortClips.length);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-foreground">In action</h3>
      <FakeClip label={clip.label} seconds={clip.seconds} hue={clip.hue} />
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{clip.label}</p>
          <p className="text-sm text-muted-foreground">{clip.caption}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => step(-1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => step(1)}>
          Next
        </Button>
        <div className="ml-2 flex items-center gap-1.5" aria-hidden>
          {shortClips.map((c, i) => (
            <span
              key={c.label}
              className={`size-1.5 rounded-full ${i === index ? "bg-foreground" : "bg-border"}`}
            />
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {index + 1} / {shortClips.length}
        </span>
      </div>
    </section>
  );
}
