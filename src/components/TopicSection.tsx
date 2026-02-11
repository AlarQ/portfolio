"use client";

import ExploreIcon from "@mui/icons-material/Explore";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface TopicSectionProps {
  topic?: string;
}

export function TopicSection({ topic }: TopicSectionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        border: "3px solid transparent",
        borderRadius: 2,
        p: 3,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
        },
        width: "100%",
        height: "100%",
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.common.white,
            }}
          >
            <ExploreIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Topic I'm Digging Into
          </Typography>
        </Box>

        <Box
          sx={{
            py: 2,
            px: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: topic ? theme.palette.text.primary : theme.palette.text.secondary,
              textAlign: "center",
              fontStyle: topic ? "normal" : "italic",
              mb: 3,
            }}
          >
            {topic ||
              "Building Development Workflows with Open Code: Focus on Approval-Based Execution"}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              textAlign: "left",
            }}
          >
            Exploring how modern AI agents can integrate into development workflows through
            approval-based execution patterns, emphasizing human oversight while leveraging
            autonomous capabilities for routine tasks.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
