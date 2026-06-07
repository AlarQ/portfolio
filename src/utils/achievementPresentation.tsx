import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { SvgIconProps } from "@mui/material";
import type React from "react";

/**
 * Single seam for how an Achievement is presented: its marker icon and the
 * palette tone used for it. The view never reaches for the icon or color map
 * directly. Mirrors `skillPresentation` / `readingPresentation`.
 */

/** The palette tone used to present an Achievement marker. */
export const achievementTone = "primary" as const;

/** The marker icon shown beside each Achievement. */
export function achievementIcon(props?: SvgIconProps): React.ReactElement<SvgIconProps> {
  return <CheckCircleIcon {...props} />;
}
