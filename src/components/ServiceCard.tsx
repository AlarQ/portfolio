"use client";

import { Box, Card, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface ServiceCardProps {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onClick?: () => void;
}

export function ServiceCard({ title, icon, backgroundColor, onClick }: ServiceCardProps) {
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
