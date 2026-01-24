"use client";

import ExploreIcon from "@mui/icons-material/Explore";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface TopicSectionProps {
  topic?: string;
}

export function TopicSection({ topic }: TopicSectionProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.divider}`,
        width: "100%",
        maxWidth: 800,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
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

        {/* Topic Content */}
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
            }}
          >
            {topic || "Coming soon..."}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
