"use client";

import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Props interface for ProjectCard component
 * Uses TypeScript utility types for flexible usage
 */
export interface ProjectCardProps {
  /** Project title displayed prominently */
  title: string;
  /** Project description text */
  description: string;
  /** MVP progress percentage (0-100) */
  mvpProgress: number;
}

/**
 * ProjectCard Component
 *
 * Displays a project with title, description, and an MVP progress bar.
 * Uses Material UI components with theme-driven styling.
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   title="My Project"
 *   description="A great project description"
 *   mvpProgress={75}
 * />
 * ```
 */
export function ProjectCard({ title, description, mvpProgress }: ProjectCardProps) {
  const theme = useTheme();

  /**
   * Determine progress bar color based on completion percentage
   * Using theme palette for consistency
   */
  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return theme.palette.success.main;
    if (progress >= 50) return theme.palette.primary.main;
    return theme.palette.secondary.main;
  };

  return (
    <Card
      data-testid="project-card"
      sx={{
        height: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
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
        {/* Title */}
        <Typography
          data-testid="project-title"
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

        {/* Description */}
        <Typography
          data-testid="project-description"
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

        {/* MVP Progress Section */}
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

          {/* Progress Bar */}
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
