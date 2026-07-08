import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual-only theme pill (Figma 614:396 dark / 614:974 light). The
 * theme-appropriate icon sits in a filled "knob" circle (the pill's inverse),
 * driven purely by semantic tokens + `dark:` variants — no JS. `aria-hidden`;
 * next-themes click wiring is deferred. `className` merges onto the root so the
 * mobile drawer can pass positioning classes.
 */
export interface ThemePillProps {
  className?: string;
}

export function ThemePill({ className }: ThemePillProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center gap-4 rounded-[29px] bg-foreground px-4 py-2 text-background",
        className
      )}
    >
      {/* Sun: bare in light, knob (circle) in dark */}
      <span className="inline-flex rounded-full dark:bg-background dark:text-foreground">
        <Sun className="size-6" />
      </span>
      {/* Moon: knob (circle) in light, bare in dark */}
      <span className="inline-flex rounded-full bg-background text-foreground dark:bg-transparent dark:text-background">
        <Moon className="size-6" />
      </span>
    </span>
  );
}
