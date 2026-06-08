import { alpha } from "@mui/material/styles";

/**
 * Single seam for the hover-glow card visual rule. The "transparent 3px border
 * that lights up with an accent border + glow on hover" lives here once, so the
 * cards that share it (`TopicSection`, `ReadingSection`, the Domain Area cards in
 * `HeroContent`) cannot drift apart. The accent is the only thing that varies —
 * callers pass `theme.palette.primary.main` or a per-area `area.color`.
 *
 * Glow opacity is spelled one way (`alpha(accent, 0.4)`); callers never re-type
 * the `${color}40` hex-suffix form. Returns a plain style object so callers can
 * spread it into a larger `sx` alongside their own layout properties.
 */
export function glowCardSx(accent: string) {
  return {
    transition: "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    border: "3px solid transparent",
    borderRadius: 2,
    p: 3,
    "&:hover": {
      borderColor: accent,
      boxShadow: `0 0 20px ${alpha(accent, 0.4)}`,
    },
  };
}
