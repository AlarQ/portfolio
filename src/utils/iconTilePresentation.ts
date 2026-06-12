/**
 * Single seam for the "centered square icon tile" geometry shared by section
 * headers (`TopicSection`, `ReadingSection` at 48px) and the Skill icon boxes
 * (`SkillsGrid` at 40px). The tile is a fixed-size, center-aligned box with a
 * background fill; size, fill and corner radius are the only things that vary,
 * so callers pass them and never re-type the flex-center geometry. This is what
 * keeps a new header tile from drifting to a different size by accident.
 *
 * Foreground (icon color) is intentionally NOT owned here: the 48px header tiles
 * tint the icon white while `SkillsGrid` colors its `& svg` by category, so each
 * caller layers its own color onto the spread style object.
 */
export function iconTileSx(size: number, bg: string, borderRadius = 2) {
  return {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
