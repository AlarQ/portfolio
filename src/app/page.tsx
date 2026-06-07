import { Box, Container, Stack } from "@mui/material";
import { HeroContent } from "@/components/HeroContent";
import { ReadingSection } from "@/components/ReadingSection";
import { TopicSection } from "@/components/TopicSection";
import { currentBooks } from "@/data/books";

export default function Home() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 4, md: 8 }}>
        <HeroContent
          imageSrc="/images/profile.jpg"
          imageAlt="Ernest Bednarczyk"
          title="SOFTWARE ENGINEER"
          subtitle="TEAM LEADER"
          stats={[
            { value: "6+", label: "Years of Experience" },
            { value: "14", label: "Engineers Led" },
            { value: "3+", label: "Years Leading Teams" },
          ]}
        />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 4, lg: 4 }}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TopicSection topic="Exploring OpenAgentsControl: AI Agent Framework for Approval-Based Development Workflows." />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ReadingSection books={currentBooks} />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
