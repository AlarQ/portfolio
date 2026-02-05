"use client";

import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface ProjectCardProps {
  title: string;
  description: string;
  mvpProgress: number;
  onClick?: () => void;
  isExpanded?: boolean;
}

export function ProjectCard({
  title,
  description,
  mvpProgress,
  onClick,
  isExpanded,
}: ProjectCardProps) {
  const theme = useTheme();

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return theme.palette.success.main;
    if (progress >= 50) return theme.palette.primary.main;
    return theme.palette.secondary.main;
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        border: isExpanded ? `2px solid ${theme.palette.primary.main}` : "none",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
          boxShadow: onClick ? theme.shadows[8] : theme.shadows[1],
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3,
            flexGrow: 1,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              MVP Progress
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: getProgressColor(mvpProgress),
                fontWeight: 600,
              }}
            >
              {mvpProgress}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={mvpProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.action.disabledBackground,
              "& .MuiLinearProgress-bar": {
                backgroundColor: getProgressColor(mvpProgress),
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
