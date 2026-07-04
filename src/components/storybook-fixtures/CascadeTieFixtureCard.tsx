import Box from "@mui/material/Box";
import { brand } from "@/theme/theme";

/**
 * ADR-DS-2 cascade-tie fixture. A single element carries both an Emotion/MUI
 * `sx` background (via the brand seam, `brand.orange`) AND a colliding
 * Tailwind utility class (`bg-red-600`) targeting the same CSS property. The
 * story wraps this in the real `ThemeProvider` + `AppRouterCacheProvider
 * options={{ enableCssLayer: true }}` stack (see `CascadeTieFixtureCard.stories.tsx`)
 * so the emitted Emotion rule actually lands in `@layer mui`, exactly as it
 * does in the live app (`src/app/layout.tsx`). `globals.css`'s
 * `@layer theme, utilities, mui;` order (declared last wins) is what the
 * e2e assertion in `e2e/cascade-tie.spec.ts` actually exercises via
 * `getComputedStyle` — not just the presence of the `@layer` declarations.
 */
export function CascadeTieFixtureCard() {
  return (
    <Box data-testid="cascade-tie-fixture" className="bg-red-600" sx={{ bgcolor: brand.orange }}>
      cascade tie fixture
    </Box>
  );
}
