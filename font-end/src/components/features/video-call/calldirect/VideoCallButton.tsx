"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isCalling?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function VideoCallButton({
  onClick,
  disabled = false,
  isCalling = false,
  variant = "ghost",
  size = "icon",
  className,
  showLabel = false,
}: VideoCallButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isCalling}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        showLabel && "gap-2",
        className
      )}
      title="Bắt đầu cuộc gọi video"
    >
      {isCalling ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          {showLabel && <span>Đang gọi...</span>}
        </>
      ) : (
        <>
          <Video className="h-4 w-4" />
          {showLabel && <span>Gọi video</span>}
        </>
      )}
    </Button>
  );
}

interface AudioCallButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isCalling?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function AudioCallButton({
  onClick,
  disabled = false,
  isCalling = false,
  variant = "ghost",
  size = "icon",
  className,
  showLabel = false,
}: AudioCallButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isCalling}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        showLabel && "gap-2",
        className
      )}
      title="Bắt đầu cuộc gọi thoại"
    >
      {isCalling ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          {showLabel && <span>Đang gọi...</span>}
        </>
      ) : (
        <>
          <Phone className="h-4 w-4" />
          {showLabel && <span>Gọi thoại</span>}
        </>
      )}
    </Button>
  );
}
