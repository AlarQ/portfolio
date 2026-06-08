"use client";

import ExploreIcon from "@mui/icons-material/Explore";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { glowCardSx } from "@/utils/glowCardPresentation";

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
        ...glowCardSx(theme.palette.primary.main),
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
            Currently exploring{" "}
            <Link
              href="https://github.com/darrenhinde/OpenAgentsControl"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Darren Hinde's OpenAgentsControl
            </Link>{" "}
            framework, an AI agent system for plan-first development workflows with approval-based
            execution. It provides pattern control, smart context discovery, and multi-language
            support (TypeScript, Python, Go, Rust) with built-in testing and validation.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
