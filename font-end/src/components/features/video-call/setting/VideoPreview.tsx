"use client";

import { SimpleCameraPreview } from "./SimpleCameraPreview";
import {
  VideoCallSettings,
  VideoPreviewProps,
} from "../../../../types/video/video-call.types";
import { Camera, CameraOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VideoPreview({
  settings,
  onSettingsChange,
}: VideoPreviewProps) {
  const handleToggleCamera = () => {
    onSettingsChange({
      cameraEnabled: !settings.cameraEnabled,
      joinWithVideo: !settings.cameraEnabled,
    });
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Enhanced Video Preview Container */}
      <div className="aspect-video relative">
        <SimpleCameraPreview
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
        
        {/* Enhanced Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        
        {/* Camera Toggle Button */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Button
            onClick={handleToggleCamera}
            className={cn(
              "rounded-full w-14 h-14 border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm",
              settings.cameraEnabled
                ? "bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/50 hover:border-red-400"
            )}
            size="sm"
          >
            {settings.cameraEnabled ? (
              <Camera className="w-6 h-6" />
            ) : (
              <CameraOff className="w-6 h-6" />
            )}
          </Button>
        </div>
        
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm border",
            settings.cameraEnabled
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              settings.cameraEnabled ? "bg-green-400" : "bg-red-400"
            )} />
            <span>{settings.cameraEnabled ? "Camera bật" : "Camera tắt"}</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Info Bar */}
      <div className="bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-sm p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Camera className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {settings.selectedCamera ? "Camera đã chọn" : "Chưa chọn camera"}
              </p>
              <p className="text-gray-400 text-xs">
                {settings.availableCameras.find(c => c.deviceId === settings.selectedCamera)?.label || "Không có thiết bị"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Settings className="w-3 h-3" />
            <span>Xem trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
