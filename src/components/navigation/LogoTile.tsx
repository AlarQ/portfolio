import Box from "@mui/material/Box";
import { logoGradient, logoShadow, logoTextColor } from "@/utils/navPresentation";

/**
 * The "EB" monogram tile shared by both nav adapters (`DesktopNav`,
 * `MobileNav`). The box geometry lives here once so the two adapters cannot
 * drift apart structurally — only the size varies. Colors come from the
 * `navPresentation` seam; geometry is parameterized by `size`.
 */

type LogoTileSize = "sm" | "lg";

const TILE: Record<LogoTileSize, { box: number; radius: string; fontSize: string }> = {
  lg: { box: 40, radius: "12px", fontSize: "1.1rem" },
  sm: { box: 32, radius: "10px", fontSize: "0.875rem" },
};

export function LogoTile({ size }: { size: LogoTileSize }) {
  const { box, radius, fontSize } = TILE[size];

  return (
    <Box
      sx={{
        width: box,
        height: box,
        borderRadius: radius,
        background: logoGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize,
        color: logoTextColor,
        boxShadow: logoShadow,
      }}
    >
      EB
    </Box>
  );
}
