import InstagramIcon from "@mui/icons-material/Instagram";
import LayersIcon from "@mui/icons-material/Layers";
import TwitterIcon from "@mui/icons-material/Twitter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WebIcon from "@mui/icons-material/Web";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Container, Stack } from "@mui/material";
import { HeroContent } from "@/components/HeroContent";
import { ProfileCard } from "@/components/ProfileCard";
import { serviceCardColors } from "@/theme/theme";

export default function Home() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 4, md: 8 },
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 4, lg: 8 }}
        alignItems={{ xs: "center", lg: "flex-start" }}
        sx={{ width: "100%" }}
      >
        {/* Profile Card */}
        <ProfileCard
          name="Ernest Bednarczyk"
          bio="A Software Engineer who has developed countless innovative solutions."
          imageSrc="/images/profile.jpg"
          imageAlt="Ernest Bednarczyk"
          socialLinks={[
            {
              icon: <VisibilityIcon />,
              href: "#",
              label: "Portfolio",
            },
            {
              icon: <TwitterIcon />,
              href: "#",
              label: "Twitter",
            },
            {
              icon: <InstagramIcon />,
              href: "#",
              label: "Instagram",
            },
            {
              icon: <YouTubeIcon />,
              href: "#",
              label: "YouTube",
            },
          ]}
        />

        {/* Hero Content */}
        <HeroContent
          title="SOFTWARE"
          subtitle="ENGINEER"
          description="Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products."
          stats={[
            { value: "+12", label: "Years of Experience" },
            { value: "+46", label: "Projects Completed" },
            { value: "+20", label: "Worldwide Clients" },
          ]}
          services={[
            {
              title: "Dynamic Animation, Motion Design",
              icon: <LayersIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.orange,
            },
            {
              title: "Framer, Figma, WordPress, ReactJS",
              icon: <WebIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.limeGreen,
            },
          ]}
        />
      </Stack>
    </Container>
  );
}
