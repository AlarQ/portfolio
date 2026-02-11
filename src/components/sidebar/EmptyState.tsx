"use client";

import GitHubIcon from "@mui/icons-material/GitHub";
import { Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function EmptyState() {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        minHeight: "60vh",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <GitHubIcon
        sx={{
          fontSize: 64,
          color: theme.palette.text.secondary,
          mb: 3,
          opacity: 0.5,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Select a project to view details
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: "center",
          mt: 2,
          opacity: 0.7,
        }}
      >
      </Typography>
    </Paper>
  );
}
