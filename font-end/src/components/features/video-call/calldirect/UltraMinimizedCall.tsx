"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrag } from "@/hooks/useDrag";

type VideoCallSize = "fullscreen" | "minimized" | "ultra-minimized";

interface UltraMinimizedCallProps {
  callerName?: string;
  callDuration: number;
  onExpand: () => void;
  onClose: () => void;
}

export function UltraMinimizedCall({
  callerName,
  callDuration,
  onExpand,
  onClose,
}: UltraMinimizedCallProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const { position, isDragging, elementRef, handleMouseDown, hasMoved } =
    useDrag({
      initialPosition: {
        x: window.innerWidth - 200,
        y: window.innerHeight - 100,
      },
      bounds: {
        minX: 0,
        maxX: window.innerWidth - 200,
        minY: 0,
        maxY: window.innerHeight - 80,
      },
    });

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 cursor-move hover:shadow-xl transition-all duration-200 z-50",
        isDragging ? "shadow-2xl scale-105" : ""
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={(e) => {
            // Chỉ expand nếu không phải drag
            if (!hasMoved && !isDragging) {
              onExpand();
            }
          }}
        >
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {callerName || "Cuộc gọi video"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDuration(callDuration)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
