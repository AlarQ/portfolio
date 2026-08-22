import type * as React from "react";

import { cn } from "@/lib/utils";

/** Clamps an arbitrary number into the meter's valid 0–100 range. */
export function clampMeterValue(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Milestone Progress meter atom (FR-8). The fill deliberately binds
 * `bg-primary` - NOT a Status hue (`bg-badge-*`/`bg-destructive`/etc.) - so
 * Milestone Progress and Feature Status read as two independent signals.
 * `legend` is required, authored by the caller (e.g. `milestoneLegend()`) -
 * this atom carries no hardcoded copy of its own (meter-legend-required).
 */
function Meter({
  className,
  value,
  legend,
  ...props
}: React.ComponentProps<"div"> & { value: number; legend: string }) {
  const clamped = clampMeterValue(value);

  return (
    <div
      data-slot="meter-group"
      className={cn("flex w-full items-center gap-3", className)}
      {...props}
    >
      <div
        data-slot="meter"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={legend}
        aria-valuetext={legend}
        className="h-meter-track flex-1 overflow-hidden rounded-full bg-secondary"
      >
        <div
          data-slot="meter-fill"
          className="h-full rounded-full bg-primary"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p data-slot="meter-legend" className="text-muted-foreground text-sm">
        {legend}
      </p>
    </div>
  );
}

export { Meter };
