"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Button, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
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
      <ErrorOutlineIcon
        sx={{
          fontSize: 64,
          color: theme.palette.error.main,
          mb: 3,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: theme.palette.text.primary,
          textAlign: "center",
          fontWeight: 500,
          mb: 2,
        }}
      >
        Failed to load project
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: "center",
          mb: 3,
        }}
      >
        The project page could not be loaded. This may be due to network issues or the site blocking
        embedding.
      </Typography>
      <Button
        variant="contained"
        onClick={onRetry}
        sx={{
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        Try Again
      </Button>
    </Paper>
  );
}
