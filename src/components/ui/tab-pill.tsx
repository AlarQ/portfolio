import { cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Dumb, presentational pill (FR-6, FR-10). No `role="tablist"`/`role="tab"`,
 * no roving-tabIndex keyboard navigation - that ARIA composite logic belongs
 * to the future `ProjectTabStrip` organism (Task 003), not this atom. This
 * atom only reflects `selected` visually via semantic tokens.
 */
const tabPillVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      selected: {
        true: "bg-primary text-primary-foreground",
        false: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: { selected: false },
  }
);

function TabPill({
  className,
  selected = false,
  ...props
}: React.ComponentProps<"span"> & { selected?: boolean }) {
  return (
    <span
      data-slot="tab-pill"
      data-selected={selected}
      className={cn(tabPillVariants({ selected }), className)}
      {...props}
    />
  );
}

export { TabPill };
