"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import type { Achievement } from "@/data/experience";

interface AchievementsListProps {
  achievements: readonly Achievement[];
  maxItems?: number;
}

export function AchievementsList({ achievements, maxItems = 4 }: AchievementsListProps) {
  const theme = useTheme();
  const displayedAchievements = achievements.slice(0, maxItems);

  return (
    <Stack spacing={1.5}>
      {displayedAchievements.map((achievement) => (
        <Box
          key={achievement.description}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 20,
              color: theme.palette.primary.main,
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {achievement.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
