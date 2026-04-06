"use client";

import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onBackToPost?: () => void;
  showBackButton?: boolean;
}

export function ImageViewer({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onBackToPost,
  showBackButton = false,
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 0.25));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0 rounded-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onBackToPost?.();
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    Quay lại bài viết
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.25))}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRotation((prev) => prev + 90)}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div className="relative max-w-full max-h-full">
              <img
                src={imageUrl}
                alt={imageName}
                className="max-w-full max-h-full object-contain transition-all duration-300 cursor-move"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="text-center text-white">
              <div className="font-medium text-lg mb-1">{imageName}</div>
              {zoom !== 1 && (
                <div className="text-sm text-white/70">
                  Zoom: {Math.round(zoom * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Zoom Indicator */}
          {zoom !== 1 && (
            <div className="absolute top-20 right-4 z-40 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
