"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ImageAttachment {
  fileId: number;
  fileName: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
}

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageAttachment[];
  initialIndex?: number;
  messageInfo?: {
    senderName: string;
    sentAt: string;
    content?: string;
  };
}

export function ImageViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  messageInfo,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // For panning
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Reset state when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasMultipleImages) {
            setCurrentIndex((prev) =>
              prev > 0 ? prev - 1 : images.length - 1
            );
            resetView();
          }
          break;
        case "ArrowRight":
          if (hasMultipleImages) {
            setCurrentIndex((prev) =>
              prev < images.length - 1 ? prev + 1 : 0
            );
            resetView();
          }
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, hasMultipleImages, images.length, onClose]);

  // Reset view when changing images
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoom + delta, 0.25), 3);
    setZoom(newZoom);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  // Handle download
  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.storageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentImage.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!currentImage || typeof navigator === "undefined" || !navigator.share)
      return;

    try {
      await navigator.share({
        title: currentImage.fileName,
        url: currentImage.storageUrl,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Navigation functions
  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      resetView();
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      resetView();
    }
  };

  // Mouse event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || !e.touches[0]) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || !e.touches[0]) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0 rounded-none">
        <DialogTitle className="sr-only">
          {currentImage.fileName} - Image Viewer
        </DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {messageInfo && (
                  <div className="text-white">
                    <div className="font-medium">{messageInfo.senderName}</div>
                    <div className="text-sm text-white/70">
                      {formatDate(messageInfo.sentAt)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Image Counter */}
                {hasMultipleImages && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {currentIndex + 1} / {images.length}
                  </Badge>
                )}

                {/* Action Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
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

                {typeof navigator !== "undefined" && "share" in navigator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                )}

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

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Main Image Container */}
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative max-w-full max-h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              <img
                src={currentImage.storageUrl}
                alt={currentImage.fileName}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                className="max-w-full max-h-full object-contain transition-all duration-300"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: "center",
                  cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "move",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="text-center text-white">
              <div className="font-medium text-lg mb-1">
                {currentImage.fileName}
              </div>
              <div className="text-sm text-white/70 flex items-center justify-center gap-4">
                <span>{formatFileSize(currentImage.fileSize)}</span>
                <span>•</span>
                <span>{currentImage.fileType}</span>
                {zoom !== 1 && (
                  <>
                    <span>•</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </>
                )}
              </div>

              {messageInfo?.content && (
                <div className="mt-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-white/90">{messageInfo.content}</p>
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
