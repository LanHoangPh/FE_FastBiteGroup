"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScrollHelperProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
}

export function ScrollHelper({
  containerRef,
  onScrollToTop,
  onScrollToBottom,
}: ScrollHelperProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      setShowScrollTop(!isAtTop);
      setShowScrollBottom(!isAtBottom);
    }
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition(); // Initial check
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, [containerRef, checkScrollPosition]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      if (onScrollToTop) onScrollToTop();
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
      if (onScrollToBottom) onScrollToBottom();
    }
  };

  if (!showScrollTop && !showScrollBottom) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {showScrollTop && (
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}

      {showScrollBottom && (
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
