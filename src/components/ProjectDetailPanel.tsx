"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface ProjectDetailPanelProps {
  title: string;
  githubUrl: string;
  onClose: () => void;
}

export function ProjectDetailPanel({ title, githubUrl, onClose }: ProjectDetailPanelProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={4}
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography variant="h6" component="h2" fontWeight={600}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              color: theme.palette.text.primary,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        component="iframe"
        src={githubUrl}
        sx={{
          width: "100%",
          height: { xs: "50vh", md: "60vh" },
          border: "none",
          display: "block",
        }}
        title={`${title} - GitHub Pages`}
      />
    </Paper>
  );
}

export default ProjectDetailPanel;
