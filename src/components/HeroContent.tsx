"use client";

import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import type { Achievement } from "@/data/experience";
import type { Skill } from "@/data/skills";
import { AchievementsList } from "./AchievementsList";
import { ServiceCard } from "./ServiceCard";
import { SkillsGrid } from "./SkillsGrid";
import { StatCard } from "./StatCard";

interface Stat {
  value: string;
  label: string;
}

interface Service {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onClick?: () => void;
}

interface ExperienceSection {
  title: string;
  description: string;
  service: Service;
}

interface HeroContentProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  stats: Stat[];
  leadershipSection: ExperienceSection;
  technicalSection: ExperienceSection;
  leadershipSkills?: readonly Skill[];
  leadershipAchievements?: readonly Achievement[];
  technicalSkills?: readonly Skill[];
  technicalAchievements?: readonly Achievement[];
}

export function HeroContent({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  stats,
  leadershipSection,
  technicalSection,
  leadershipSkills,
  leadershipAchievements,
  technicalSkills,
  technicalAchievements,
}: HeroContentProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1 }}>
      <Stack spacing={4}>
        {/* Profile Image + Title Area */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          alignItems={{ xs: "center", md: "flex-start" }}
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
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              flexShrink: 0,
            }}
          >
            <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: "cover" }} />
          </Box>

          {/* Title and Subtitle */}
          <Box>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: "3rem", md: "4.5rem" },
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.1,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={4}>
          {stats.map((stat) => (
            <Grid size={4} key={stat.label}>
              <StatCard value={stat.value} label={stat.label} />
            </Grid>
          ))}
        </Grid>

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
          {/* Leadership Section */}
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
                borderColor: "#5f9610",
                boxShadow: "0 0 20px rgba(95, 150, 16, 0.4)",
              },
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
                {leadershipSection.title}
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
                {leadershipSection.description}
              </Typography>

              {/* Skills Grid */}
              {leadershipSkills && (
                <Box sx={{ mt: 3 }}>
                  <SkillsGrid skills={leadershipSkills} columns={{ xs: 1, sm: 2, md: 2 }} />
                </Box>
              )}
            </Box>

            {/* Divider */}
            {leadershipAchievements && <Divider sx={{ my: 3 }} />}

            {/* Achievements */}
            {leadershipAchievements && (
              <AchievementsList achievements={leadershipAchievements} maxItems={4} />
            )}

            <Box sx={{ mt: 4 }}>
              <ServiceCard
                title={leadershipSection.service.title}
                icon={leadershipSection.service.icon}
                backgroundColor={leadershipSection.service.backgroundColor}
                onClick={leadershipSection.service.onClick}
              />
            </Box>
          </Box>

          {/* Technical Section */}
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
                borderColor: "#c55a0d",
                boxShadow: "0 0 20px rgba(197, 90, 13, 0.4)",
              },
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
                {technicalSection.title}
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
                {technicalSection.description}
              </Typography>

              {/* Skills Grid */}
              {technicalSkills && (
                <Box sx={{ mt: 3 }}>
                  <SkillsGrid
                    skills={technicalSkills}
                    columns={{ xs: 1, sm: 2, md: 3 }}
                    groupByCategory={true}
                  />
                </Box>
              )}
            </Box>

            {/* Divider */}
            {technicalAchievements && <Divider sx={{ my: 3 }} />}

            {/* Achievements */}
            {technicalAchievements && (
              <AchievementsList achievements={technicalAchievements} maxItems={4} />
            )}

            <Box sx={{ mt: 4 }}>
              <ServiceCard
                title={technicalSection.service.title}
                icon={technicalSection.service.icon}
                backgroundColor={technicalSection.service.backgroundColor}
                onClick={technicalSection.service.onClick}
              />
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
