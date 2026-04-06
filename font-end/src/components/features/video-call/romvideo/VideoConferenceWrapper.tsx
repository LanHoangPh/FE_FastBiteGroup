"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { VideoConference, useRoomContext } from "@livekit/components-react";

interface VideoConferenceWrapperProps {
  className?: string;
  chatMessageFormatter?: (message: string) => string;
}

export function VideoConferenceWrapper({
  className,
  chatMessageFormatter,
}: VideoConferenceWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const room = useRoomContext();

  // Memoized error handler for LiveKit layout errors
  const handleError = useCallback((event: ErrorEvent) => {
    const errorPatterns = [
      "Element not part of the array",
      "updatePages",
      "_camera_placeholder",
      "GridLayout",
      "useVisualStableUpdate",
      "No subscription", // SessionManager errors
      "Cannot read properties of undefined",
      "Cannot read property",
    ];

    if (errorPatterns.some((pattern) => event.message?.includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, []);

  // Memoized promise rejection handler
  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      const errorPatterns = [
        "Element not part of the array",
        "updatePages",
        "_camera_placeholder",
        "No subscription",
      ];

      if (
        errorPatterns.some((pattern) =>
          event.reason?.message?.includes(pattern)
        )
      ) {
        event.preventDefault();
      }
    },
    []
  );

  // Optimized error boundary setup
  useEffect(() => {
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError, handleUnhandledRejection]);

  // Memoized video conference props
  const videoConferenceProps = useMemo(
    () => ({
      chatMessageFormatter,
      className: "h-full w-full",
    }),
    [chatMessageFormatter]
  );

  return (
    <div ref={containerRef} className={className}>
      <VideoConference {...videoConferenceProps} />
    </div>
  );
}
