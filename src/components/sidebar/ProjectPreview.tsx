"use client";

import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

interface ProjectPreviewProps {
  title?: string;
  githubUrl: string;
  onError: () => void;
}

export function ProjectPreview({ title, githubUrl, onError }: ProjectPreviewProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        minHeight: "60vh",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography variant="h6" component="h2" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme.palette.background.default,
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.divider,
            borderRadius: "4px",
            "&:hover": {
              background: theme.palette.text.secondary,
            },
          },
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.palette.background.paper,
              zIndex: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}

        <Box
          component="iframe"
          src={githubUrl}
          onError={onError}
          onLoad={handleLoad}
          sx={{
            width: "100%",
            height: "100%",
            minHeight: "600px",
            border: "none",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
          title={`${title} - GitHub Pages`}
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </Box>
    </Paper>
  );
}
