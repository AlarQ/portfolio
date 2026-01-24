"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export function Header() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Left side: Your name */}
        <Typography variant="h6" component="div">
          Ernest Bednarczyk
        </Typography>

        {/* Spacer - pushes nav to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side: Nav links */}
        <Button component={Link} href="/">
          Home
        </Button>
        <Button component={Link} href="/blog">
          Blog
        </Button>
        <Button component={Link} href="/projects">
          Projects
        </Button>
      </Toolbar>
    </AppBar>
  );
}
