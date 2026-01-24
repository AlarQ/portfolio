import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
export default function Home() {
  return (
    <Container sx={{ py: 8 }}>
      <Box
        sx={{
          variant: "h2",
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // stack on mobile, row on desktop
          alignItems: "center",
          gap: 4,
        }}
      >
        <Image
          style={{ borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          src="/images/profile.jpg"
          alt="Ernest Bednarczyk"
          width={300}
          height={300}
        />
        <Stack direction="column" spacing={2}>
          <Typography variant="h1" sx={{ fontStyle: "italic", fontWeight: 300 }}>
            Ernest Bednarczyk
          </Typography>
          <Typography variant="h4">Software Engineer and Team Lead</Typography>
          <Typography variant="body1">
            I'm a software engineer and team lead with a passion for building scalable and efficient
            systems.
          </Typography>{" "}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained">View Projects</Button>
            <Button variant="outlined">Contact Me</Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
