"use client";

import { Box, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ServiceCard } from "./ServiceCard";
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

interface HeroContentProps {
  title: string;
  subtitle: string;
  description: string;
  stats: Stat[];
  services: Service[];
}

export function HeroContent({ title, subtitle, description, stats, services }: HeroContentProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1, maxWidth: 800 }}>
      <Stack spacing={4}>
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

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "1.1rem",
            lineHeight: 1.7,
            maxWidth: 600,
          }}
        >
          {description}
        </Typography>

        <Grid container spacing={4}>
          {stats.map((stat) => (
            <Grid size={4} key={stat.label}>
              <StatCard value={stat.value} label={stat.label} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid size={{ xs: 12, sm: 6 }} key={service.title}>
              <ServiceCard
                title={service.title}
                icon={service.icon}
                backgroundColor={service.backgroundColor}
                onClick={service.onClick}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
