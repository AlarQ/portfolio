import type { Preview } from "@storybook/nextjs";
import { Inter } from "next/font/google";
import { brand } from "../src/theme/theme";
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
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={inter.variable} style={{ fontFamily: "var(--font-inter)" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
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
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: brand.white },
        { name: "dark", value: brand.backgroundDefault },
      ],
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
