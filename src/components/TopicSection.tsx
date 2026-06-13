"use client";

import ExploreIcon from "@mui/icons-material/Explore";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { currentTopic } from "@/data/topic";
import { glowCardSx } from "@/utils/glowCardPresentation";
import { iconTileSx } from "@/utils/iconTilePresentation";

export function TopicSection() {
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
              ...iconTileSx(48, theme.palette.primary.main),
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
              color: theme.palette.text.primary,
              textAlign: "center",
              mb: 3,
            }}
          >
            {currentTopic.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              textAlign: "left",
            }}
          >
            {currentTopic.descriptionBefore}
            <Link
              href={currentTopic.link.href}
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
              {currentTopic.link.label}
            </Link>
            {currentTopic.descriptionAfter}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
