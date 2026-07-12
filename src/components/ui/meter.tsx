import type * as React from "react";

import { cn } from "@/lib/utils";

/** Clamps an arbitrary number into the meter's valid 0–100 range. */
export function clampMeterValue(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * MVP-Progress meter atom (FR-6, D-8). The fill deliberately binds
 * `bg-primary` — NOT a Status hue (`bg-badge-*`/`bg-destructive`/etc.) — so
 * MVP Progress and Status read as two independent signals (spec.md
 * meter-legend-label). Legend/label content is Task 002 chunk 2, not here.
 */
function Meter({ className, value, ...props }: React.ComponentProps<"div"> & { value: number }) {
  const clamped = clampMeterValue(value);

  return (
    <div data-slot="meter-group" className={cn("w-full", className)} {...props}>
      <div
        data-slot="meter"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-meter-track w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          data-slot="meter-fill"
          className="h-full rounded-full bg-primary"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p data-slot="meter-legend" className="mt-meter-legend-gap text-muted-foreground text-sm">
        {clamped}% to first usable release
      </p>
    </div>
  );
}

export { Meter };
