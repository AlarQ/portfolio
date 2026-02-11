import CodeIcon from "@mui/icons-material/Code";
import GroupsIcon from "@mui/icons-material/Groups";
import { Box, Container, Stack } from "@mui/material";
import { Suspense } from "react";
import { ContributionGraph, ContributionGraphSkeleton } from "@/components/ContributionGraph";
import { HeroContent } from "@/components/HeroContent";
import { ReadingSection } from "@/components/ReadingSection";
import { TopicSection } from "@/components/TopicSection";
import { currentBooks } from "@/data/books";
import { leadershipAchievements, technicalAchievements } from "@/data/experience";
import { leadershipSkills, technicalSkills } from "@/data/skills";
import { serviceCardColors } from "@/theme/theme";

export default function Home() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 4, md: 8 }}>
        <HeroContent
          imageSrc="/images/profile.jpg"
          imageAlt="Ernest Bednarczyk"
          title="ENGINEERING"
          subtitle="TEAM LEADER"
          stats={[
            { value: "6+", label: "Years of Experience" },
            { value: "14", label: "Engineers Led" },
            { value: "3+", label: "Years Leading Teams" },
          ]}
          leadershipSection={{
            title: "Leadership & Engineering Management",
            description:
              "Led teams of 14 engineers across Sportsbook and Casino domains, delivering complex microservice-based systems. Focused on mentoring, technical excellence, and stakeholder collaboration.",
            service: {
              title: "Leadership & Management: Team Growth, Delivery",
              icon: <GroupsIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.limeGreen,
            },
          }}
          technicalSection={{
            title: "Technical Development Expertise",
            description:
              "6+ years building scalable systems in Scala and Rust. Expert in microservices, event-driven architectures, and distributed systems on Kubernetes/GCP.",
            service: {
              title: "Backend Development: Scala, Rust, Microservices",
              icon: <CodeIcon sx={{ fontSize: 40 }} />,
              backgroundColor: serviceCardColors.orange,
            },
          }}
          leadershipSkills={leadershipSkills}
          leadershipAchievements={leadershipAchievements}
          technicalSkills={technicalSkills}
          technicalAchievements={technicalAchievements}
        />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 4, lg: 4 }}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TopicSection topic="Building Development Workflows with Open Code: Focus on Approval-Based Execution." />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ReadingSection books={currentBooks} />
          </Box>
        </Stack>

        <Suspense fallback={<ContributionGraphSkeleton />}>
          <ContributionGraph username="AlarQ" />
        </Suspense>
      </Stack>
    </Container>
  );
}
