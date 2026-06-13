"use client";

import { Box, Card, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * The headline card for a Domain Area — the bottom card that states the area's
 * offering (e.g. "Backend Development: Rust, Scala, Microservices"). Driven by
 * `DomainArea.headline` and the area's accent color. See CONTEXT.md.
 */
interface AreaHeadlineCardProps {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onClick?: () => void;
}

export function AreaHeadlineCard({ title, icon, backgroundColor, onClick }: AreaHeadlineCardProps) {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor,
        color: theme.palette.common.white,
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
            }
          : {},
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ mb: 2 }}>{icon}</Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.common.white,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            flexGrow: 1,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Card>
  );
}
