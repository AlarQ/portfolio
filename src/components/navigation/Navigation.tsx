"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState } from "react";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: { xs: 16, sm: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "100%",
          maxWidth: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)", md: 1200 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(20, 27, 34, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)",
            borderRadius: 3,
            px: { xs: 2, sm: 3 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
          }}
        >
          <DesktopNav />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 16, sm: 24 },
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "100%",
        maxWidth: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)", md: 1200 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(20, 27, 34, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)",
          borderRadius: 3,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        {isMobile ? <MobileNav /> : <DesktopNav />}
      </Box>
    </Box>
  );
}
