"use client";

import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { cloneElement } from "react";
import { domainAreas } from "@/data/domains";
import { ownerProfile } from "@/data/profile";
import { brand, withAlpha } from "@/theme/theme";
import { glowCardSx } from "@/utils/glowCardPresentation";
import { skillIcon } from "@/utils/skillPresentation";
import { AchievementsList } from "./AchievementsList";
import { AreaHeadlineCard } from "./AreaHeadlineCard";
import { SkillsGrid } from "./SkillsGrid";
import { StatCard } from "./StatCard";

export function HeroContent() {
  const { imageSrc, imageAlt, title, subtitle, stats } = ownerProfile;
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1 }}>
      <Stack spacing={4}>
        {/* Profile Image + Title Area */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 6 }}
          alignItems="center"
        >
          {/* Circular Profile Image */}
          <Box
            sx={{
              position: "relative",
              width: { xs: 150, md: 200 },
              height: { xs: 150, md: 200 },
              borderRadius: "50%",
              border: `4px solid ${theme.palette.background.paper}`,
              overflow: "hidden",
              boxShadow: `0 4px 20px ${withAlpha(brand.black, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: "cover" }} />
          </Box>

          {/* Titles and Stats Container */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 16 }}
            alignItems={{ xs: "center", md: "center" }}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {/* Title with horizontal separator */}
            <Stack spacing={0} sx={{ flexShrink: 0 }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", md: "1.85rem" },
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography>

              <Divider sx={{ borderColor: theme.palette.primary.main, my: 1 }} />

              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", md: "1.85rem" },
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </Typography>
            </Stack>

            {/* Stats - Horizontal layout */}
            <Stack
              direction="row"
              spacing={0}
              sx={{ ml: { md: -12 } }}
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: theme.palette.divider }}
                />
              }
            >
              {stats.map((stat) => (
                <Box key={stat.label} sx={{ px: { xs: 1.5, md: 2.5 } }}>
                  <StatCard value={stat.value} label={stat.label} />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>

        {/* Leadership & Technical Sections - Side by Side on Desktop */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 4 }}
          alignItems="stretch"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", md: "block" },
                borderColor: theme.palette.divider,
              }}
            />
          }
        >
          {domainAreas.map((area) => (
            <Box
              key={area.name}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                ...glowCardSx(area.color),
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: "1.25rem",
                  }}
                >
                  {area.heading}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    mb: 3,
                  }}
                >
                  {area.blurb}
                </Typography>

                {/* Skills Grid */}
                <Box sx={{ mt: 3 }}>
                  <SkillsGrid
                    skills={area.skills}
                    columns={area.skillsLayout.columns}
                    groupByCategory={area.skillsLayout.groupByCategory}
                  />
                </Box>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 3 }} />

              {/* Achievements */}
              <AchievementsList achievements={area.achievements} maxItems={4} />

              <Box sx={{ mt: 4 }}>
                <AreaHeadlineCard
                  title={area.headline}
                  icon={cloneElement(skillIcon(area.icon), { sx: { fontSize: 40 } })}
                  backgroundColor={area.color}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
