"use client";

import { useEffect } from "react";

export function ScreenShareTextOverride() {
  useEffect(() => {
    const overrideScreenShareText = () => {
      // Find all screen share participant tiles
      const screenShareTiles = document.querySelectorAll(
        '.lk-participant-tile[data-lk-source="screen_share"]'
      );

      screenShareTiles.forEach((tile) => {
        const nameElement = tile.querySelector(".lk-participant-name");
        if (nameElement) {
          // Get the original participant name
          const originalName = nameElement.textContent || "";

          // Only change if it contains "'s screen" pattern
          if (originalName.includes("'s screen")) {
            // Extract the name before "'s screen"
            const participantName = originalName
              .replace("'s screen", "")
              .trim();

            // Update the text to "Màn hình của [name]"
            nameElement.textContent = `Màn hình của ${participantName}`;
          }
        }

        // Fix screen share video display issues
        const videoElement = tile.querySelector("video");
        if (videoElement) {
          // Ensure video is visible and properly sized
          videoElement.style.width = "100%";
          videoElement.style.height = "100%";
          videoElement.style.objectFit = "contain";
          videoElement.style.background = "#000";
          videoElement.style.position = "absolute";
          videoElement.style.top = "0";
          videoElement.style.left = "0";
          videoElement.style.right = "0";
          videoElement.style.bottom = "0";

          // Force video to be visible
          videoElement.style.display = "block";
          videoElement.style.visibility = "visible";
          videoElement.style.opacity = "1";

          // Force video to play if paused (common issue when tab is hidden)
          if (videoElement.paused) {
            videoElement.play().catch(() => {
              // Ignore play errors, video might not be ready
            });
          }

          // Force video to load if not loaded
          if (videoElement.readyState < 2) {
            videoElement.load();
          }
        }

        // Ensure tile container is properly styled
        const tileElement = tile as HTMLElement;
        tileElement.style.position = "relative";
        tileElement.style.overflow = "hidden";
        tileElement.style.background = "#000";
        tileElement.style.minHeight = "200px";
        tileElement.style.display = "flex";
        tileElement.style.alignItems = "center";
        tileElement.style.justifyContent = "center";
      });
    };

    // Run immediately
    overrideScreenShareText();

    // Set up observer to watch for new screen share tiles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.classList?.contains("lk-participant-tile") &&
                element.getAttribute("data-lk-source") === "screen_share"
              ) {
                overrideScreenShareText();
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Handle zoom events
    const handleZoom = () => {
      setTimeout(() => {
        overrideScreenShareText();
      }, 100);
    };

    // Listen for zoom events
    window.addEventListener("resize", handleZoom);
    window.addEventListener("orientationchange", handleZoom);

    // Listen for zoom changes (browser zoom)
    const mediaQuery = window.matchMedia("(min-resolution: 1.25dppx)");
    mediaQuery.addEventListener("change", handleZoom);

    // Handle tab visibility changes (minimize/maximize)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible again, fix screen share
        setTimeout(() => {
          overrideScreenShareText();
        }, 200);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle window focus/blur events
    const handleWindowFocus = () => {
      setTimeout(() => {
        overrideScreenShareText();
      }, 100);
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowFocus);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleZoom);
      window.removeEventListener("orientationchange", handleZoom);
      mediaQuery.removeEventListener("change", handleZoom);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowFocus);
    };
  }, []);

  return null; // This component doesn't render anything
}
