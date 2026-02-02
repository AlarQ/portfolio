"use client";

import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

interface ProfileCardProps {
  name: string;
  bio: string;
  imageSrc: string;
  imageAlt: string;
  socialLinks?: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
}

export function ProfileCard({ bio, imageSrc, imageAlt, socialLinks = [] }: ProfileCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: { xs: 4, md: 5 },
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.divider}`,
        maxWidth: 400,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        spacing={{ xs: 3, md: 4 }}
        alignItems="center"
        sx={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: 200, md: 220 },
            height: { xs: 200, md: 220 },
            borderRadius: "50%",
            border: `4px solid ${theme.palette.background.paper}`,
            overflow: "hidden",
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`,
          }}
        >
          <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: "cover" }} />
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: 2,
              borderTop: `2px dotted ${theme.palette.secondary.main}`,
              top: "50%",
              left: 0,
            }}
          />
          <Box
            sx={{
              position: "relative",
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: theme.palette.secondary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: theme.palette.background.paper,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              px: 2,
              lineHeight: 1.8,
            }}
          >
            {bio}
          </Typography>
        </Box>

        {socialLinks.length > 0 && (
          <Stack direction="row" spacing={2} justifyContent="center">
            {socialLinks.map((link) => (
              <IconButton
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                sx={{
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.secondary.main,
                  },
                }}
              >
                {link.icon}
              </IconButton>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
