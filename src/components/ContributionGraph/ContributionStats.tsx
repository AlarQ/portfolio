"use client";

import {
  BarChart as BarChartIcon,
  CalendarToday as CalendarIcon,
  Code as CodeIcon,
  LocalFireDepartment as FireIcon,
  Folder as FolderIcon,
  MergeType as PullRequestIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import type { ContributionStatsProps } from "@/types/contributions";

export function ContributionStats({ stats }: ContributionStatsProps) {
  const theme = useTheme();

  const statItems = [
    {
      icon: <BarChartIcon />,
      label: "Total Commits",
      value: stats.totalCommits.toString(),
      color: theme.palette.primary.main,
    },
    {
      icon: <PullRequestIcon />,
      label: "Pull Requests",
      value: stats.totalPullRequests.toString(),
      color: theme.palette.secondary.main,
    },
    {
      icon: <FolderIcon />,
      label: "Active Repos",
      value: stats.activeRepositories.toString(),
      color: theme.palette.info.main,
    },
    {
      icon: <CodeIcon />,
      label: "Lines of Code",
      value: stats.totalLinesOfCode,
      color: theme.palette.primary.dark,
    },
    {
      icon: <TrophyIcon />,
      label: "Top Languages",
      value: stats.linesByLanguage,
      color: theme.palette.secondary.dark,
    },
    {
      icon: <FireIcon />,
      label: "Current Streak",
      value: `${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`,
      color: theme.palette.error.main,
    },
    {
      icon: <TrophyIcon />,
      label: "Longest Streak",
      value: `${stats.longestStreak} day${stats.longestStreak !== 1 ? "s" : ""}`,
      color: theme.palette.warning.main,
    },
    {
      icon: <CalendarIcon />,
      label: "Most Active Day",
      value: stats.mostActiveDay,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        Contribution Stats
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {statItems.map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: `${item.color}20`,
                color: item.color,
              }}
            >
              {item.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: "block",
                  fontSize: "0.75rem",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}
