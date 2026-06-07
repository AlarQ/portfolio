import { useEffect, useRef, useState } from "react";

export interface Carousel {
  /** Clamped, render-safe index — always within [0, length - 1] for a non-empty carousel. */
  index: number;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

/**
 * Carousel index state: wrap-around prev/next, jump-to, and reset-to-start when
 * the item count changes. Pure-ish state logic extracted from rendering so the
 * index math is testable without a DOM.
 */
export function useCarousel(length: number): Carousel {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevLengthRef = useRef(length);

  useEffect(() => {
    if (length !== prevLengthRef.current) {
      setCurrentIndex(0);
      prevLengthRef.current = length;
    }
  }, [length]);

  const index = length > 0 ? Math.min(currentIndex, length - 1) : 0;

  const previous = () => {
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
  };

  const goTo = (target: number) => {
    setCurrentIndex(target);
  };

  return { index, next, previous, goTo };
}
