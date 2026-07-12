import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { type StatusTone, statusDotVariants } from "./statusDotVariants";

function StatusDot({
  className,
  tone = "muted",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusDotVariants> & { tone?: StatusTone }) {
  return (
    <span
      data-slot="status-dot"
      data-tone={tone}
      role="presentation"
      className={cn(statusDotVariants({ tone }), className)}
      {...props}
    />
  );
}

export { StatusDot };
