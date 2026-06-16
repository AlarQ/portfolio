// UNREACHABLE while the `/` → `/blog` redirect in next.config.ts is active
// (config redirects fire before filesystem routing). Kept intentionally so a
// real home page can be restored by removing that one redirect rule — do not
// wire new behavior here expecting it to serve. See next.config.ts `redirects()`.
import { Box, Container, Stack } from "@mui/material";
import { HeroContent } from "@/components/HeroContent";
import { ReadingSection } from "@/components/ReadingSection";
import { TopicSection } from "@/components/TopicSection";
import { currentBooks } from "@/data/books";
import { pageShellSx } from "@/theme/layout";

export default function Home() {
  return (
    <Container maxWidth="xl" sx={pageShellSx}>
      <Stack spacing={{ xs: 4, md: 8 }}>
        <HeroContent />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 4, lg: 4 }}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TopicSection />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ReadingSection books={currentBooks} />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
