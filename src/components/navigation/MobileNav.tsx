"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HamburgerButton } from "./HamburgerButton";
import { NavLink } from "./NavLink";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/cv/Ernest_Bednarczyk_CV_01_2025.pdf", label: "Resume", external: true },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firstLinkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeDrawer]);

  // Focus management - focus first link when drawer opens
  useEffect(() => {
    if (isOpen && firstLinkRef.current) {
      // Small delay to ensure drawer is rendered
      setTimeout(() => {
        const firstLink = firstLinkRef.current?.querySelector("a");
        firstLink?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const drawerVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Box
            component={motion.div}
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={closeDrawer}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1200,
            }}
          />

          {/* Drawer */}
          <Box
            component={motion.div}
            id="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            sx={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "80%",
              maxWidth: 320,
              backgroundColor: "rgba(20, 27, 34, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
              zIndex: 1300,
              display: "flex",
              flexDirection: "column",
              pt: 8,
              px: 4,
            }}
          >
            {/* Navigation Links */}
            <Box
              ref={firstLinkRef}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {navItems.map((item, index) => (
                <Box
                  key={item.href}
                  component={motion.div}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    minHeight: 48, // Large touch target
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NavLink
                    href={item.href}
                    label={item.label}
                    external={item.external}
                    onClick={closeDrawer}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Logo/Name */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "1rem",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
          }}
        >
          Ernest Bednarczyk
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Hamburger Button */}
        <HamburgerButton isOpen={isOpen} onClick={toggleDrawer} />
      </Box>

      {/* Render drawer in portal to avoid z-index issues */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
