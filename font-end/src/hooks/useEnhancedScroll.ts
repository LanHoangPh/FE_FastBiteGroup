import { useRef, useCallback, useEffect } from "react";

interface ScrollPosition {
  x: number;
  y: number;
}

interface UseEnhancedScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  scrollToTop: () => void;
  scrollToElement: (elementId: string) => void;
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
  isScrolledToBottom: () => boolean;
}

export function useEnhancedScroll(): UseEnhancedScrollReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });
  const isScrollingRef = useRef(false);

  // Scroll to bottom of container
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      isScrollingRef.current = true;
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, []);

  // Scroll to top of container
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      isScrollingRef.current = true;
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, []);

  // Scroll to specific element
  const scrollToElement = useCallback((elementId: string) => {
    if (scrollContainerRef.current) {
      const element = document.getElementById(elementId);
      if (element) {
        isScrollingRef.current = true;
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    }
  }, []);

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      savedPositionRef.current = {
        x: scrollContainerRef.current.scrollLeft,
        y: scrollContainerRef.current.scrollTop,
      };
    }
  }, []);

  // Restore saved scroll position
  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      isScrollingRef.current = true;
      scrollContainerRef.current.scrollTo({
        left: savedPositionRef.current.x,
        top: savedPositionRef.current.y,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, []);

  // Check if scrolled to bottom (with tolerance)
  const isScrolledToBottom = useCallback((): boolean => {
    if (!scrollContainerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    return Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // 10px tolerance
  }, []);

  // Handle scroll events to detect user scrolling
  useEffect(() => {
    const handleScroll = () => {
      // If we're not programmatically scrolling, reset the flag
      if (!isScrollingRef.current) {
        isScrollingRef.current = false;
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return {
    scrollContainerRef: scrollContainerRef as React.RefObject<HTMLDivElement>,
    scrollToBottom,
    scrollToTop,
    scrollToElement,
    saveScrollPosition,
    restoreScrollPosition,
    isScrolledToBottom,
  };
}
