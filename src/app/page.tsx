import CodeIcon from "@mui/icons-material/Code";
import GitHubIcon from "@mui/icons-material/GitHub";
import GroupsIcon from "@mui/icons-material/Groups";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
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
          bio="Engineering Team Leader with 6+ years of commercial software development experience, including 3+ years leading backend and full-stack teams within the iGaming domain."
          imageSrc="/images/profile.jpg"
          imageAlt="Ernest Bednarczyk"
          socialLinks={[
            {
              icon: <LinkedInIcon />,
              href: "https://www.linkedin.com/in/ernest-bednarczyk/",
              label: "LinkedIn",
            },
            {
              icon: <GitHubIcon />,
              href: "https://github.com/AlarQ",
              label: "GitHub",
            },
          ]}
        />

        {/* Hero Content */}
        <HeroContent
          title="ENGINEERING"
          subtitle="TEAM LEADER"
          description="Experienced in leading cross-functional engineering teams, owning end-to-end delivery of complex microservice-based systems, and collaborating with product, stakeholders, and external partners. Strong technical background in Scala and Rust, combined with a pragmatic leadership approach focused on team growth, technical excellence, and reliable delivery."
          stats={[
            { value: "6+", label: "Years of Experience" },
            { value: "14", label: "Engineers Led" },
            { value: "3+", label: "Years Leading Teams" },
          ]}
          services={[
            {
              title: "Backend Development: Scala, Rust, Microservices",
              icon: <CodeIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.orange,
            },
            {
              title: "Leadership & Management: Team Growth, Delivery",
              icon: <GroupsIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.limeGreen,
            },
          ]}
        />
      </Stack>
    </Container>
  );
}
