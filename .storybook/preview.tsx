import type { Decorator, Preview } from "@storybook/nextjs";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import "../src/app/globals.css";

/**
 * Mirror `layout.tsx`'s Inter instantiation. Storybook never renders the app's
 * `layout.tsx`, so `--font-inter` (consumed by `body` in `globals.css`) would
 * otherwise be undefined and every story would fall back to Arial — visibly
 * off from the Figma frames, which are 100% Inter. The decorator below stamps
 * this variable onto the story root so the primitives inherit real Inter.
 */
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

/**
 * Global Storybook decorator surface. The shadcn primitives (Task 004+) are the
 * Figma *light* look and are self-contained: they read their colors from the
 * semantic tokens in `tokens.css` (`:root`), imported via `globals.css` above.
 * They MUST NOT be wrapped in the legacy MUI dark `ThemeProvider` — its
 * `CssBaseline` paints a dark `body` (theme `mode:"dark"`, bg `#0a1118`) and,
 * because Storybook has no `AppRouterCacheProvider`/`enableCssLayer`, that
 * baseline injects UNLAYERED and defeats the `@layer theme,utilities,mui`
 * quarantine the live app relies on — inverting every story vs Figma. Stories
 * render on the raw light tokens so Storybook matches the Figma frames.
 *
 * Task 008 (FR-9): the `theme` toolbar item below (a `globalTypes` toggle, the
 * idiomatic Storybook 9/10 mechanism) flips `.dark` on the document root. No
 * `next-themes`/`ThemeProvider` is needed here — `tokens.css`'s `.dark {}`
 * block is a plain class selector, not a `:root`-only rule, so it cascades from
 * any ancestor element carrying the class. Existing stories from tasks 001-007
 * need zero per-story change to pick up dark: they already bind only to the
 * semantic aliases this class swap re-points (FR-9 acceptance #2).
 *
 * The `dark` class + token background live on `<html>`/`<body>` (not the story
 * wrapper) so the full-canvas dark fill (commit a8cc121) survives regardless of
 * each story's `parameters.layout`. The wrapper carries ONLY the Inter font, so
 * it is layout-neutral: `layout: 'centered' | 'fullscreen' | 'padded'` governs
 * story placement freely instead of being defeated by a `min-h-screen` wrapper.
 */
const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals?.theme === "dark";
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    // These body writes duplicate `globals.css` `body { background; color }` ON
    // PURPOSE: the `backgrounds` addon (parameters below) paints `body` via its
    // own inline style, which out-specifies the `globals.css` rule. An inline
    // write here is the only thing that out-ranks the addon so the semantic
    // token wins and the full canvas repaints dark on toggle (commit a8cc121 /
    // task 008). Verified: `body` computes `#090d1f` in dark, white in light.
    // Do not delete as "dead duplication" — dark canvas breaks without it.
    document.body.style.backgroundColor = "var(--background)";
    document.body.style.color = "var(--foreground)";
  }, [isDark]);

  return (
    <div className={inter.variable} style={{ fontFamily: "var(--font-inter)" }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [withTheme],
  parameters: {
    /**
     * Global default layout (rule 3). Atomic components override to `centered`
     * and full-width page/template organisms override to `fullscreen` on their
     * own `meta.parameters.layout`; everything else falls back to `padded`.
     */
    layout: "padded",
    /**
     * Custom "iphone15" viewport (390x844) matching the Figma mobile frame,
     * selected by name via `mobileViewportParameters` in the Pages pack's
     * `Mobile` story variants (task 007). Storybook 10's built-in viewport
     * addon (registered as `storybook/viewport` in `main.ts`) resolves this
     * name and resizes the preview iframe accordingly. Full mobile-viewport
     * regression coverage still lives in `e2e/pages-mobile-viewport.spec.ts`.
     */
    viewport: {
      viewports: {
        iphone15: {
          name: "iPhone 15",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
      },
    },
    /**
     * Task 008: no `backgrounds.values` dark swatch here. That mechanism paints
     * the preview iframe body a static color and would conflict with the real
     * dark-mode mechanism above (the `theme` toolbar's `.dark` class swap,
     * which repaints every semantic-token consumer, not just the iframe body).
     * A stale swatch previously pointed at the legacy MUI dark bg (`#0a1118`,
     * `brand.backgroundDefault`) — since removed to leave exactly one "dark"
     * definition (the real Figma dark frame in `tokens.ts`/`tokens.css`).
     */
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "var(--background)" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
