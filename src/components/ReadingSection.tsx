"use client";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BookIcon from "@mui/icons-material/Book";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { Box, Card, Chip, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type ReadingCategory = "IT" | "Self-Development" | "Business" | "Fiction" | "Other";

export interface ReadingItem {
  title: string;
  author?: string;
  category: ReadingCategory;
  coverImage?: string;
  quote?: string;
}

interface ReadingSectionProps {
  books?: ReadingItem[];
}

const categoryColors: Record<ReadingCategory, string> = {
  IT: "#0ea5e9",
  "Self-Development": "#84cc16",
  Business: "#f97316",
  Fiction: "#a855f7",
  Other: "#64748b",
};

export function ReadingSection({ books = [] }: ReadingSectionProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevBooksLengthRef = useRef(books.length);

  useEffect(() => {
    if (books.length !== prevBooksLengthRef.current) {
      setCurrentIndex(0);
      prevBooksLengthRef.current = books.length;
    }
  }, [books.length]);

  if (books.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, books.length - 1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? books.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === books.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const arrowButtonStyles = {
    position: "absolute" as const,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
    zIndex: 2,
    boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`,
  };

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.divider}`,
        width: "100%",
        maxWidth: 800,
        position: "relative",
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.common.white,
            }}
          >
            <BookIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Currently Reading
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            overflow: "visible",
            borderRadius: 2,
            mx: { xs: 0, sm: -4 },
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 2,
              px: { xs: 0, sm: 6 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                transform: `translateX(-${safeIndex * 100}%)`,
                transition: "transform 0.3s ease-in-out",
              }}
            >
              {books.map((book, index) => (
                <Box
                  key={`${book.title}-${index}`}
                  sx={{
                    minWidth: "100%",
                    width: "100%",
                    px: 1,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    alignItems={{ xs: "flex-start", md: "flex-start" }}
                  >
                    {book.coverImage && (
                      <Box
                        sx={{
                          position: "relative",
                          width: 120,
                          height: 180,
                          borderRadius: 2,
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
                          mx: { xs: "auto", md: 0 },
                        }}
                      >
                        <Image
                          src={book.coverImage}
                          alt={`${book.title} cover`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                    )}

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={3}
                      sx={{ flex: 1, width: "100%" }}
                    >
                      <Stack spacing={2} sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              mb: 0.5,
                            }}
                          >
                            {book.title}
                          </Typography>
                          {book.author && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            >
                              by {book.author}
                            </Typography>
                          )}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: { xs: "center", sm: "flex-start" },
                          }}
                        >
                          <Chip
                            label={book.category}
                            sx={{
                              backgroundColor: categoryColors[book.category],
                              color: theme.palette.common.white,
                              fontWeight: 600,
                              width: "fit-content",
                            }}
                          />
                        </Box>
                      </Stack>

                      {book.quote && (
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            position: "relative",
                            pl: { sm: 3 },
                            borderLeft: { sm: `2px solid ${theme.palette.divider}` },
                            minWidth: { sm: 200 },
                          }}
                        >
                          <FormatQuoteIcon
                            sx={{
                              fontSize: 40,
                              color: theme.palette.text.secondary,
                              opacity: 0.3,
                              position: "absolute",
                              top: -8,
                              left: { xs: 0, sm: 8 },
                            }}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              fontStyle: "italic",
                              color: theme.palette.text.secondary,
                              lineHeight: 1.7,
                              pt: 2,
                              textAlign: { xs: "center", sm: "left" },
                            }}
                          >
                            {book.quote}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          {books.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  ...arrowButtonStyles,
                  left: { xs: 4, sm: -20 },
                }}
                aria-label="Previous book"
              >
                <ArrowBackIosIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  ...arrowButtonStyles,
                  right: { xs: 4, sm: -20 },
                }}
                aria-label="Next book"
              >
                <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          )}
        </Box>

        {books.length > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {books.map((book, index) => (
              <Box
                key={`dot-${book.title}`}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    index === safeIndex ? theme.palette.primary.main : theme.palette.divider,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor:
                      index === safeIndex
                        ? theme.palette.primary.dark
                        : theme.palette.text.secondary,
                  },
                }}
                aria-label={`Go to book ${index + 1}`}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Card>
  );
}
