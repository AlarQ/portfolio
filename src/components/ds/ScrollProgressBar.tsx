export interface ScrollProgressBarProps {
  readonly progress: number;
  readonly reducedMotion?: boolean;
}

/**
 * Presentational mobile reading-progress bar (FR-1, blog-readability
 * Decision 5): a thin, non-interactive top bar reflecting whole-document
 * scroll progress. Owns no scroll subscription - `ArticleToc` (the client
 * organism) computes `progress` via `useScrollProgress` and passes it down.
 *
 * `md:hidden` - mobile-only; the desktop dot-rail (`TableOfContents`) is the
 * only ToC affordance at `md` and up, never both at once.
 */
export function ScrollProgressBar({ progress, reducedMotion = false }: ScrollProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-reduced-motion={String(reducedMotion)}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent md:hidden"
    >
      <div
        className="h-full origin-left bg-primary transition-transform duration-75 data-[reduced-motion=true]:transition-none"
        data-reduced-motion={String(reducedMotion)}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
