"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Maximize2,
  Minus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrag } from "@/hooks/useDrag";
import { VideoCallMinimizedLayout } from "./LiveKitVideoCallDirect";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";

type VideoCallSize = "fullscreen" | "minimized" | "ultra-minimized";

interface MinimizedCallProps {
  callerInfo: any;
  callDuration: number;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  liveKitControls: any;
  onSizeChange: (size: VideoCallSize) => void;
  onClose: () => void;
  localUserName?: string;
  localUserAvatar?: string;
}

export function MinimizedCall({
  callerInfo,
  callDuration,
  isVideoEnabled,
  isAudioEnabled,
  liveKitControls,
  onSizeChange,
  onClose,
  localUserName,
  localUserAvatar,
}: MinimizedCallProps) {
  // ✅ Get `room` from context
  const { videoCallState } = useVideoCallContext();
  const { room } = videoCallState;
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
        x: window.innerWidth - 340,
        y: window.innerHeight - 280,
      },
      bounds: {
        minX: 0,
        maxX: window.innerWidth - 320,
        minY: 0,
        maxY: window.innerHeight - 240,
      },
    });

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden w-80 h-60",
        isDragging ? "shadow-2xl scale-105" : ""
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header - draggable area */}
      <div
        className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0 p-2 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={callerInfo?.avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xs">
              {callerInfo?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {callerInfo?.fullName}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatDuration(callDuration)}
              </Badge>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Ultra minimize button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasMoved && !isDragging) {
                onSizeChange("ultra-minimized");
              }
            }}
            className="w-6 h-6"
            title="Thu nhỏ tối đa"
          >
            <Minus className="w-3 h-3" />
          </Button>

          {/* Maximize button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasMoved && !isDragging) {
                onSizeChange("fullscreen");
              }
            }}
            className="w-6 h-6"
            title="Mở rộng"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Kết thúc cuộc gọi"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Video Conference */}
      <div className="flex-1 relative min-h-0">
        {room ? (
          // ✅ Render the minimized video layout (shows remote participant prominently)
          <VideoCallMinimizedLayout
            room={room}
            partnerName={callerInfo?.fullName}
            partnerAvatar={callerInfo?.avatarUrl}
            localUserName={localUserName}
            localUserAvatar={localUserAvatar}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-white text-sm">Connecting...</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMoved && !isDragging) {
              liveKitControls?.toggleAudio();
            }
          }}
          className="rounded-full w-8 h-8"
        >
          {isAudioEnabled ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMoved && !isDragging) {
              liveKitControls?.toggleVideo();
            }
          }}
          className="rounded-full w-8 h-8"
        >
          {isVideoEnabled ? (
            <Video className="w-4 h-4" />
          ) : (
            <VideoOff className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="rounded-full w-8 h-8"
        >
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
